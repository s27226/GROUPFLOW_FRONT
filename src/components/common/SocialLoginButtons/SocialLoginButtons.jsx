import { authStyles } from "../../layout";
import googleLogo from "../../../images/google-logo.png";
import facebookLogo from "../../../images/facebook-logo.png";

/**
 * Social login buttons component for Google and Facebook authentication
 * Currently displays placeholder buttons (not implemented)
 */
export default function SocialLoginButtons({ onGoogleClick, onFacebookClick }) {
    return (
        <div className={authStyles.socialLoginCircles}>
            <button className={authStyles.circleBtnGoogle} onClick={onGoogleClick} title="Login with Google">
                <img
                    src={googleLogo}
                    alt="Google"
                    className={authStyles.socialImg}
                />
            </button>
            <button
                className={authStyles.circleBtnFacebook}
                onClick={onFacebookClick}
                title="Login with Facebook"
            >
                <img
                    src={facebookLogo}
                    alt="Facebook"
                    className={authStyles.socialImg}
                />
            </button>
        </div>
    );
}
