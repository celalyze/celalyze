// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TaxReportAttestation
/// @notice Allows Celo wallet owners to publish a verifiable hash of their
///         annual tax report on-chain. The hash is computed off-chain by
///         Celalyze and submitted here as a tamper-proof attestation.
contract TaxReportAttestation {
    struct Attestation {
        bytes32 reportHash; // keccak256 of the tax report JSON
        uint16  taxYear;
        uint256 timestamp;
    }

    // wallet => taxYear => Attestation
    mapping(address => mapping(uint16 => Attestation)) public attestations;

    // ordered list of attestors for off-chain enumeration
    mapping(address => uint16[]) public attestedYears;

    event ReportAttested(
        address indexed wallet,
        uint16  indexed taxYear,
        bytes32         reportHash,
        uint256         timestamp
    );

    /// @notice Publish or update the tax report hash for a given year.
    /// @param reportHash keccak256 hash of the Celalyze-generated tax report
    /// @param taxYear    4-digit tax year (e.g. 2025)
    function attest(bytes32 reportHash, uint16 taxYear) external {
        require(reportHash != bytes32(0), "empty hash");
        require(taxYear >= 2020 && taxYear <= 2100, "invalid year");

        bool isNew = attestations[msg.sender][taxYear].timestamp == 0;

        attestations[msg.sender][taxYear] = Attestation({
            reportHash: reportHash,
            taxYear:    taxYear,
            timestamp:  block.timestamp
        });

        if (isNew) {
            attestedYears[msg.sender].push(taxYear);
        }

        emit ReportAttested(msg.sender, taxYear, reportHash, block.timestamp);
    }

    /// @notice Verify a hash matches the stored attestation.
    function verify(address wallet, uint16 taxYear, bytes32 reportHash)
        external
        view
        returns (bool)
    {
        return attestations[wallet][taxYear].reportHash == reportHash;
    }

    /// @notice Get all years a wallet has attested.
    function getAttestedYears(address wallet)
        external
        view
        returns (uint16[] memory)
    {
        return attestedYears[wallet];
    }
}
