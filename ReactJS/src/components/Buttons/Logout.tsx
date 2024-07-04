import React from 'react';
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

type LogoutProps = {
    
};

const Logout:React.FC<LogoutProps> = () => {
    const [ signOut, ,  ] = useSignOut(auth);
    const navigate = useNavigate();
    const handleLogout = () => {
        signOut();
        navigate('/');
        window.location.reload();
    }
    return (
        <button className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange'
            onClick={handleLogout}    
        >
            Log out
        </button>
    )
}
export default Logout;