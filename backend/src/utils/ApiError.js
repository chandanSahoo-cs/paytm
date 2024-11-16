class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong",errors = []){
        super(message)
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        this.data = null;
    }
}

export default ApiError