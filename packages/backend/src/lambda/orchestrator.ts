import { signPaymasterData } from '../lib/paymaster';
import { submitUserOpToBundler } from '../lib/bundler';

export const handler = async (event: any) => {
    // console.log("Event: ", JSON.stringify(event, null, 2));

    try {
        const body = JSON.parse(event.body || '{}');
        const { action } = body;

        if (action === 'sign_paymaster') {
            const { userOpHash, validUntil, validAfter, paymasterAddress } = body;
            // TODO: Validate userOp details against policy (e.g. whitelist, rate limit)

            const paymasterAndData = await signPaymasterData(
                userOpHash,
                validUntil || 0,
                validAfter || 0,
                paymasterAddress
            );

            return {
                statusCode: 200,
                body: JSON.stringify({ paymasterAndData }),
            };
        }

        if (action === 'submit_userop') {
            const { userOp } = body;
            const txHash = await submitUserOpToBundler(userOp);

            return {
                statusCode: 200,
                body: JSON.stringify({ txHash }),
            };
        }

        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid action' }),
        };

    } catch (error: any) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
