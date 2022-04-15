import { ContractErrorType, GetOracleDetailsInput } from "../types";

declare const ContractError: ContractErrorType;

export const getOracleDetails = ({
	identifier,
	state,
	oraclesType
}: GetOracleDetailsInput) => {
  if (!identifier) {
    throw new ContractError("Missing oracle identifier");
  }

  const oracleDetails = state[oraclesType][identifier];
	
	if (!oracleDetails) {
    throw new ContractError(`Oracle with identifier ${identifier} does not exist`);
  }

	const identifierObject = oraclesType === 'nodes'
		? { address: identifier }
		: { id: identifier };

	return { ...oracleDetails, ...identifierObject }
};
