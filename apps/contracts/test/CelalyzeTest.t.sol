// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {TaxReportAttestation} from "../src/TaxReportAttestation.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";

contract CelalyzeTest is Test {
    TaxReportAttestation public attestation;
    AgentRegistry public registry;

    address public user = address(0x123);

    function setUp() public {
        attestation = new TaxReportAttestation();
        registry = new AgentRegistry();
    }

    function test_AttestAndVerifyTaxReport() public {
        vm.startPrank(user);

        bytes32 reportHash = keccak256(abi.encodePacked("sample_tax_report_2026"));
        uint16 taxYear = 2026;

        attestation.attest(reportHash, taxYear);

        bool isValid = attestation.verify(user, taxYear, reportHash);
        assertTrue(isValid);

        uint16[] memory attestedYearsList = attestation.getAttestedYears(user);
        assertEq(attestedYearsList.length, 1);
        assertEq(attestedYearsList[0], taxYear);

        vm.stopPrank();
    }

    function test_RegisterAgent() public {
        vm.startPrank(user);

        uint256 agentId = registry.registerAgent(
            "Celalyze",
            "1.0.0",
            "Onchain Tax & Portfolio Agent",
            "https://celalyze.vercel.app",
            "tax,pnl,chat,attestation"
        );

        assertEq(agentId, 0);

        (
            string memory name,
            string memory version,
            string memory description,
            string memory endpoint,
            string memory capabilities,
            address owner,
            ,
            ,
            bool active
        ) = registry.agents(agentId);

        assertEq(name, "Celalyze");
        assertEq(version, "1.0.0");
        assertEq(owner, user);
        assertTrue(active);

        vm.stopPrank();
    }
}
