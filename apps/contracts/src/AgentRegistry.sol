// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentRegistry
/// @notice On-chain registry for AI agents operating on the Celo ecosystem.
///         Celalyze registers itself here, making its identity, version, and
///         capabilities publicly verifiable — aligned with Track 4 (Aigora).
contract AgentRegistry {
    struct Agent {
        string  name;
        string  version;
        string  description;
        string  endpoint;      // public API endpoint (no secrets)
        string  capabilities;  // comma-separated: "tax,pnl,chat,attestation"
        address owner;
        uint256 registeredAt;
        uint256 updatedAt;
        bool    active;
    }

    // agentId => Agent
    mapping(uint256 => Agent) public agents;

    // owner => agentIds they own
    mapping(address => uint256[]) public agentsByOwner;

    uint256 public totalAgents;

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string  name,
        string  version
    );

    event AgentUpdated(
        uint256 indexed agentId,
        string  version,
        string  endpoint
    );

    event AgentDeactivated(uint256 indexed agentId);

    /// @notice Register a new agent. Returns the assigned agentId.
    function registerAgent(
        string calldata name,
        string calldata version,
        string calldata description,
        string calldata endpoint,
        string calldata capabilities
    ) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "name required");
        require(bytes(version).length > 0, "version required");

        agentId = totalAgents++;

        agents[agentId] = Agent({
            name:         name,
            version:      version,
            description:  description,
            endpoint:     endpoint,
            capabilities: capabilities,
            owner:        msg.sender,
            registeredAt: block.timestamp,
            updatedAt:    block.timestamp,
            active:       true
        });

        agentsByOwner[msg.sender].push(agentId);

        emit AgentRegistered(agentId, msg.sender, name, version);
    }

    /// @notice Update mutable fields of an owned agent.
    function updateAgent(
        uint256        agentId,
        string calldata version,
        string calldata description,
        string calldata endpoint,
        string calldata capabilities
    ) external {
        Agent storage a = agents[agentId];
        require(a.owner == msg.sender, "not owner");
        require(a.active, "agent deactivated");

        a.version      = version;
        a.description  = description;
        a.endpoint     = endpoint;
        a.capabilities = capabilities;
        a.updatedAt    = block.timestamp;

        emit AgentUpdated(agentId, version, endpoint);
    }

    /// @notice Deactivate an agent (soft delete).
    function deactivate(uint256 agentId) external {
        Agent storage a = agents[agentId];
        require(a.owner == msg.sender, "not owner");
        a.active = false;
        emit AgentDeactivated(agentId);
    }

    /// @notice Get all agentIds owned by an address.
    function getAgentsByOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return agentsByOwner[owner];
    }
}
