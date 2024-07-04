import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { authModalState } from '../../atoms/authModalAtom';


type NavbarProps = {

};

const Navbar: React.FC<NavbarProps> = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    const handleClick = () => {
        setAuthModalState((prev) => ({ ...prev, isOpen: true }));
    }

    return (
        <div className='relative flex h-[50px] w-full shrink-0 items-center px-5 text-dark-gray-7'>
            <div className={`flex w-full items-center justify-between max-w-[1200px] mx-auto`}>
                <Link to='/' className='flex items-center justify-center h-20 text-brand-orange text-lg font-semibold'>
                    PsyCoding
                </Link>

                <div className="flex items-center">
                    <button
                        className="bg-brand-orange text-white px-2 py-1 sm:px-4 rounded-md text-sm font-medium
                hover:text-brand-orange hover:bg-white hover:border-2 hover:border-brand-orange border-2 border-transparent
                transition duration-300 ease-in-out"
                        onClick={handleClick}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
export default Navbar;