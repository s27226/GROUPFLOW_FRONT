import "../../../styles/auth.css";
import googleLogo from "../../../images/google-logo.png";
import facebookLogo from "../../../images/facebook-logo.png";

/**
 * Social login buttons component for Google and Facebook authentication
 * Currently displays placeholder buttons (not implemented)
 */
export default function SocialLoginButtons({ onGoogleClick, onFacebookClick }) {
    return (
        <div className="social-login-circles">
            <button className="circle-btn google" onClick={onGoogleClick} title="Login with Google">
                <img
                    src={googleLogo}
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
                    src={facebookLogo}
                    alt="Facebook"
                    className="social-img"
                />
            </button>
        </div>
    );
}
