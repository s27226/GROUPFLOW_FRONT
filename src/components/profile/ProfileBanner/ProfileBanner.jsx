import { useImageLoaded } from "../../../hooks";
import styles from "./ProfileBanner.module.css";

const ProfileBanner = ({ src, alt = "Banner" }) => {
    const { loaded, handleLoad } = useImageLoaded();

    return (
        <div className={styles.profileBanner}>
            {!loaded && (
                <div
                    className="skeleton"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "900px",
                        height: "200px",
                        borderRadius: "12px"
                    }}
                />
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className={loaded ? styles.loaded : ""}
                onLoad={handleLoad}
            />
        </div>
    );
};

export default ProfileBanner;
