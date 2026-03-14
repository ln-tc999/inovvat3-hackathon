// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {YieldOptimizerCore} from "./YieldOptimizerCore.sol";
import {AgentPolicy} from "./AgentPolicy.sol";

/// @title AutoYieldConsumer
/// @notice Chainlink Functions consumer + Automation upkeep
///         Triggers every 6h, calls LLM via Functions, then executes yield actions
contract AutoYieldConsumer is FunctionsClient, AutomationCompatibleInterface {
    using FunctionsRequest for FunctionsRequest.Request;

    // ─── State ───────────────────────────────────────────────────────────────
    YieldOptimizerCore public immutable core;
    AgentPolicy public immutable policy;

    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    uint256 public interval; // seconds between upkeeps (default 6h)
    uint256 public lastUpkeep;
    address public owner;

    // pending request tracking
    mapping(bytes32 => address) public pendingRequests; // requestId => user

    // JS source stored on-chain (IPFS CID or inline)
    string public jsSource;

    event RequestSent(bytes32 indexed requestId, address indexed user);
    event RequestFulfilled(bytes32 indexed requestId, address indexed user);
    event UpkeepPerformed(uint256 timestamp);

    error NotOwner();
    error UpkeepNotNeeded();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(
        address _router,
        address _core,
        address _policy,
        bytes32 _donId,
        uint64 _subscriptionId,
        string memory _jsSource
    ) FunctionsClient(_router) {
        core = YieldOptimizerCore(_core);
        policy = AgentPolicy(_policy);
        donId = _donId;
        subscriptionId = _subscriptionId;
        jsSource = _jsSource;
        gasLimit = 300_000;
        interval = 6 hours;
        owner = msg.sender;
    }

    // ─── Automation ──────────────────────────────────────────────────────────
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = (block.timestamp - lastUpkeep) >= interval;
        performData = "";
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp - lastUpkeep) < interval) revert UpkeepNotNeeded();
        lastUpkeep = block.timestamp;
        emit UpkeepPerformed(block.timestamp);
        // In production: iterate registered users and send Functions request per user
        // For MVP: owner triggers manually or via a single user address stored here
    }

    // ─── Chainlink Functions ─────────────────────────────────────────────────
    /// @notice Send LLM request for a specific user
    /// @param user The Safe address
    /// @param args [userInstruction, balancesJSON, poolsJSON]
    function requestYieldDecision(
        address user,
        string[] calldata args
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(jsSource);
        req.setArgs(args);

        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        pendingRequests[requestId] = user;
        emit RequestSent(requestId, user);
    }

    /// @notice Chainlink Functions callback — parse response and execute
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /* err */
    ) internal override {
        address user = pendingRequests[requestId];
        if (user == address(0)) return;
        delete pendingRequests[requestId];

        // Decode actions from ABI-encoded response
        // Backend encodes: abi.encode(YieldOptimizerCore.YieldAction[])
        YieldOptimizerCore.YieldAction[] memory actions =
            abi.decode(response, (YieldOptimizerCore.YieldAction[]));

        core.executeBatch(user, actions);
        emit RequestFulfilled(requestId, user);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────
    function setJsSource(string calldata _jsSource) external onlyOwner {
        jsSource = _jsSource;
    }

    function setInterval(uint256 _interval) external onlyOwner {
        interval = _interval;
    }

    function setSubscriptionId(uint64 _subId) external onlyOwner {
        subscriptionId = _subId;
    }
}
