export class TankerkoenigError extends Error {
    override name = "TankerkoenigError" as const;
    response: Response | undefined;

    constructor(message: string, response?: Response) {
        super(message);
        this.response = response;
    }
}
