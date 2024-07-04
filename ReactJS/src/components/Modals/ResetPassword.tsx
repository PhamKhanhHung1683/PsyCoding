import React, { useEffect, useState } from 'react';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { toast } from 'react-toastify';

type ResetPasswordProps = {
    
};

const ResetPassword:React.FC<ResetPasswordProps> = () => {
    const [email, setEmail] = useState("");
    const [sendPasswordResetEmail, , error] = useSendPasswordResetEmail(auth);
    const handleReset = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const success = await sendPasswordResetEmail(email);
        if (success) {
            toast.success("Sent email! Please check your email to reset password.", {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };
    
    useEffect(()=>{
        if(error){
            toast.error(error.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }, [error])
    return (
        <form className='space-y-6 px-6 pb-4' onSubmit={handleReset}>
            <h3 className='text-xl font-medium text-white'>Reset password</h3>
            <div>
                <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>
                    Email
                </label>
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    type='email'
                    name='email'
                    id='email'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-500 border-gray-500 text-white'
                />
            </div>
            <button type='submit'
                className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'
            >
                Reset Password
            </button>
        </form>
    );
}
export default ResetPassword;