import logoImg from '../../assets/images/logo.svg';
import loadingGif from '../../assets/images/loading.gif';
import './styles.css';

export default function LoadingScreen() {
    return (
        <div className="loading-container">
            <div className="loading-background">
                <img height="20%" src={logoImg} alt="Proffy" />
                <img height="10%" src={loadingGif} alt="Loading"/>
            </div>
        </div>
    );
}