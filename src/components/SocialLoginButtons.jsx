import React from "react";
import "../styles/auth.css";

/**
 * Social login buttons component for Google and Facebook authentication
 * Currently displays placeholder buttons (not implemented)
 */
export default function SocialLoginButtons({ onGoogleClick, onFacebookClick }) {
    return (
        <div className="social-login-circles">
            <button
                className="circle-btn google"
                onClick={onGoogleClick}
                title="Login with Google"
            >
                <img
                    src={require("../images/google-logo.png")}
                    alt="Google"
                    className="social-img"
                />
            </button>
            <button
                className="circle-btn facebook"
                onClick={onFacebookClick}
                title="Login with Facebook"
            >
                <img
                    src={require("../images/facebook-logo.png")}
                    alt="Facebook"
                    className="social-img"
                />
            </button>
        </div>
    );
}

