// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title AgentPolicy
/// @notice Stores per-user agent configuration: risk tier, allowlist, daily limits, instruction hash
contract AgentPolicy {
    struct Policy {
        uint8 maxRisk;           // 1-10 scale
        uint256 dailyLimit;      // max USD value (18 decimals) agent can move per day
        uint256 sessionExpiry;   // unix timestamp when session key expires
        bytes32 instructionHash; // keccak256 of user's NL instruction stored off-chain
        bool active;
    }

    // protocol address => allowed
    mapping(address => mapping(address => bool)) public protocolAllowlist;
    mapping(address => Policy) public policies;
    // user => day => amount spent
    mapping(address => mapping(uint256 => uint256)) public dailySpent;

    event PolicyUpdated(address indexed user, uint8 maxRisk, uint256 dailyLimit, uint256 sessionExpiry);
    event AllowlistUpdated(address indexed user, address indexed protocol, bool allowed);
    event AgentPaused(address indexed user);
    event AgentResumed(address indexed user);

    error PolicyNotActive();
    error DailyLimitExceeded();
    error ProtocolNotAllowed();
    error SessionExpired();
    error Unauthorized();

    modifier onlyUser(address user) {
        if (msg.sender != user) revert Unauthorized();
        _;
    }

    /// @notice Set or update policy for caller
    function setPolicy(
        uint8 maxRisk,
        uint256 dailyLimit,
        uint256 sessionDuration,
        bytes32 instructionHash,
        address[] calldata allowedProtocols
    ) external {
        policies[msg.sender] = Policy({
            maxRisk: maxRisk,
            dailyLimit: dailyLimit,
            sessionExpiry: block.timestamp + sessionDuration,
            instructionHash: instructionHash,
            active: true
        });

        for (uint256 i = 0; i < allowedProtocols.length; ) {
            protocolAllowlist[msg.sender][allowedProtocols[i]] = true;
            emit AllowlistUpdated(msg.sender, allowedProtocols[i], true);
            unchecked { ++i; }
        }

        emit PolicyUpdated(msg.sender, maxRisk, dailyLimit, block.timestamp + sessionDuration);
    }

    /// @notice Kill switch — user can pause agent at any time
    function pauseAgent() external {
        policies[msg.sender].active = false;
        emit AgentPaused(msg.sender);
    }

    function resumeAgent() external {
        policies[msg.sender].active = true;
        emit AgentResumed(msg.sender);
    }

    /// @notice Validate an action before execution
    function validateAction(address user, address protocol, uint256 amount) external {
        Policy storage p = policies[user];
        if (!p.active) revert PolicyNotActive();
        if (block.timestamp > p.sessionExpiry) revert SessionExpired();
        if (!protocolAllowlist[user][protocol]) revert ProtocolNotAllowed();

        uint256 today = block.timestamp / 1 days;
        uint256 spent = dailySpent[user][today] + amount;
        if (spent > p.dailyLimit) revert DailyLimitExceeded();
        dailySpent[user][today] = spent;
    }

    function getPolicy(address user) external view returns (Policy memory) {
        return policies[user];
    }
}
