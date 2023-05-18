import { IconButton } from '@mui/material';
import { FunctionComponent } from 'react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGithubAuth } from '../GithubAuth/useGithubAuth';

type Props = {
    onOpen: () => void
}

const GitHubAccessControl: FunctionComponent<Props> = ({ onOpen }) => {
	const {signedIn} = useGithubAuth()
    return (
        <IconButton onClick={onOpen}>
            <FontAwesomeIcon icon={faGithub} style={{color: signedIn ? 'darkblue' : 'gray'}} />
        </IconButton>
    );
}

export default GitHubAccessControl