import { IconButton } from '@mui/material';
import { FunctionComponent } from 'react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGithubAuth } from '../GithubAuth/useGithubAuth';
import { Login, Logout } from '@mui/icons-material';

type Props = {
    onOpen: () => void
}

const GitHubAccessControl: FunctionComponent<Props> = ({ onOpen }) => {
	const {signedIn} = useGithubAuth()
    return (
        <IconButton onClick={onOpen}>
            {/* <FontAwesomeIcon icon={faGithub} style={{color: signedIn ? 'darkblue' : 'gray'}} /> */}
            {signedIn ? (
                <Logout />
            ) : (
                <Login />
            )}
        </IconButton>
    );
}

export default GitHubAccessControl