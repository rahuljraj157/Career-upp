
import React from 'react'
import InputAuth from '../../Components/user/fields/InputAuth'
import {Link, useNavigate} from 'react-router-dom'
import { useAuthFormHook } from '../../hooks/authFormHook'
import { GoogleLogin ,GoogleOAuthProvider } from '@react-oauth/google';
import { validateCreds, validatePassword } from '../../utils/authFormValidate';
import { errorPopAlert, passwordValidationAlert } from '../../utils/alerts';
import DotsLoader from '../../Components/loaders/DotsLoader';
import { login, signUp } from '../../api/authApiService';
import { toast } from 'react-hot-toast';
import { otpHandler } from '../../utils/otpHandler';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../../Redux/slices/slice';
import { axiosInstance } from '../../api/axiosInstance';
import { Helmet } from 'react-helmet-async';

interface AuthProps {
    isLogin: boolean
}

const Auth: React.FC<AuthProps> = ({isLogin}) => {

    const {userData , setIsLoading , handleChangeData , isLoading} = useAuthFormHook();
    const { showOtpModal } = otpHandler()
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if(!isLogin) {
                // ✅ validation
                const {result , message} = validateCreds(userData , true);
                if(!result) {
                    errorPopAlert(message);
                    setIsLoading(false);
                    return;
                }

                if(!validatePassword(userData.password)) {
                    passwordValidationAlert();
                    setIsLoading(false);
                    return;
                }

                // ✅ STEP 1: Send OTP
                const response = await signUp(userData , '', true);
                toast.success(response?.data?.message);

                // ✅ STEP 2: Show OTP modal
                const otp = await showOtpModal();
                if(!otp){
                    setIsLoading(false);
                    return;
                }

                // ✅ STEP 3: Verify OTP
                const res = await signUp(userData , otp, false);

                if(res?.data?.message) {
                    toast.success(res.data.message);
                    navigate('/login');
                }

            } else {
                // ✅ login flow
                const {result , message} = validateCreds(userData , false);
                if(!result) {
                    errorPopAlert(message);
                    setIsLoading(false);
                    return;
                }

                const response = await login(userData);

                if(response.data.userData){
                    dispatch(setUserInfo(response.data.userData));
                    localStorage.setItem('userToken', JSON.stringify(response.data.token));
                } 
                else if(response.data.companyData){
                    dispatch(setUserInfo(response.data.companyData));
                    localStorage.setItem('userToken', JSON.stringify(response.data.token));
                }

                toast.success(response.data.message , {
                    duration : 2000 ,
                    style : {color : '#fff' , background : 'black'}
                });

                setTimeout(() => {
                    navigate('/feed');
                }, 3000);           
            }

        } catch (error: any) {
            console.log('AUTH ERROR:', error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>  
            <Helmet>
                <title>{isLogin ? 'Login To CareerUp' : 'Get Started'}</title>
            </Helmet>

            <GoogleOAuthProvider clientId='1069980957814-rl6peosj00rc6vhdpoosnsv9usbcrgta.apps.googleusercontent.com'>
            <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-bl from-[#eef2f3] to-[#8e9eab] p-4'>
                <div className='bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-3xl mx-auto md:flex'>

                    {/* LEFT PANEL */}
                    <div className='w-full md:w-1/2 p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-300'>
                        <h2 className='text-2xl font-bold mb-4'>
                            {isLogin ? 'Welcome Back!' : 'Join CareerUP'}
                        </h2>
                        <p className='text-gray-600 mb-4'>
                            {isLogin ? 'Login to Continue' : 'Sign up to explore new opportunities'}
                        </p>

                        {!isLoading && (
                            isLogin ? (
                                <p className='mt-10 text-center text-sm text-gray-500'>
                                    Do not have an Account?  
                                    <Link to={'/register'} className='font-semibold text-violet-900 hover:text-indigo-500'>
                                        Register
                                    </Link>
                                </p>
                            ) : (
                                <p className='mt-10 text-center text-sm text-gray-500'>
                                    Already a user? 
                                    <Link to={'/login'} className='font-semibold text-violet-900 hover:text-indigo-500'>
                                        Sign in
                                    </Link>
                                </p>
                            )
                        )}
                    </div>

                    {/* RIGHT PANEL */}
                    <div className='w-full md:w-1/2 p-8'>
                        <form onSubmit={handleSubmit} className='space-y-4'>

                            {isLogin ? (
                                <>
                                    <InputAuth labelName='email' name='email' value={userData.email} onChange={handleChangeData} placeholder='user@gmail.com' type='email' isNormalInput={true}/>
                                    <InputAuth labelName='password' name='password' value={userData.password} onChange={handleChangeData} placeholder='**********' type='password' isNormalInput={true}/>
                                </>
                            ) : (
                                <>
                                    <InputAuth labelName='username' name='username' value={userData.username} onChange={handleChangeData} placeholder='John Doe' type='text' isNormalInput={true}/>
                                    <InputAuth labelName='email' name='email' value={userData.email} onChange={handleChangeData} placeholder='user@gmail.com' type='email' isNormalInput={true}/>
                                    <InputAuth labelName='phone' name='phone' value={userData.phone} onChange={handleChangeData} placeholder='95*******3' type='text' isNormalInput={true}/>
                                    <InputAuth labelName='role' name='role' type='' value={userData.role} onChange={handleChangeData} placeholder='Select Your Role' isNormalInput={false}/>
                                    <InputAuth labelName='password' name='password' value={userData.password} onChange={handleChangeData} placeholder='**********' type='password' isNormalInput={true}/>
                                </>
                            )}

                            {isLoading ? (
                                <DotsLoader/>
                            ) : (
                                <button type='submit' className='w-full bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-800'>
                                    {isLogin ? 'Login' : 'Signup'}
                                </button>
                            )}

                            <p className='lg:text-lg font-semibold text-center py-1 text-black'>OR</p>

                            {/* GOOGLE LOGIN */}
                            <div className='flex justify-center items-center'>
                                <GoogleLogin
                                    onSuccess={credRes => {
                                        const credential = credRes.credential;
                                        if (!credential) {
                                            toast.error("Google credential not received.");
                                            return;
                                        }

                                        if (!isLogin) {
                                            axiosInstance.post('/auth/google', { token: credential })
                                                .then(res => {
                                                    toast.success(res.data.message);
                                                    setTimeout(() => navigate('/login'), 3000);
                                                })
                                                .catch(() => toast.error("Google signup failed."));
                                        } else {
                                            axiosInstance.post('/auth/google/login', { token: credential })
                                                .then(res => {
                                                    dispatch(setUserInfo(res.data.userData));
                                                    localStorage.setItem('userToken', JSON.stringify(res.data.token));
                                                    toast.success(res.data.message);
                                                    setTimeout(() => navigate('/feed'), 3000);
                                                })
                                                .catch(() => toast.error("Google login failed."));
                                        }
                                    }}
                                    onError={() => errorPopAlert('Google authentication failed!')}
                                />
                            </div>

                        </form>
                    </div>

                </div>
            </div>
            </GoogleOAuthProvider>
        </>
    )
}

export default Auth