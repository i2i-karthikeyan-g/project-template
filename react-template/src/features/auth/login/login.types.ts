
export interface ILoginForm {
    username: string;
    password: string;
}

export interface ILoginResponse {
    access_token: string;
    token_type: string;
}

export interface ILoginError {
    message: string;
    field?: string;
}
