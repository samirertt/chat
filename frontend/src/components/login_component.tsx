import React from 'react';

const Login = () => {
    return (
        <div className="w-full min-h-screen flex items-center justify-center loginpage">
            <div className="w-full flex justify-center gap-4 px-4">
                
                {/* Basic Plan Card */}
                <div className="w-full sm:w-[300px] md:w-[350px] lg:w-[400px] xl:w-[450px] h-auto py-6 px-4 rounded-xl logincard shadow-lg">
                    <h2 className="text-xl text-white font-semibold mb-4">Basic Plan</h2>
                    <p className="text-white mb-4">Perfect for individuals who need basic features.</p>
                    <ul className="list-disc list-inside mb-4 text-white">
                        <li>5 Projects</li>
                        <li>10 GB Storage</li>
                        <li>Email Support</li>
                    </ul>
                    <p className="text-lg font-bold mb-4 text-white">$10/month</p>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                        Choose Plan
                    </button>
                </div>
                
                {/* Standard Plan Card */}
                <div className="w-full sm:w-[300px] md:w-[350px] lg:w-[400px] xl:w-[450px] h-auto py-6 px-4 rounded-xl logincard shadow-lg">
                    <h2 className="text-xl text-white font-semibold mb-4">Standard Plan</h2>
                    <p className="text-white mb-4">Ideal for small teams and growing businesses.</p>
                    <ul className="list-disc list-inside mb-4 text-white">
                        <li>20 Projects</li>
                        <li>50 GB Storage</li>
                        <li>Priority Support</li>
                    </ul>
                    <p className="text-lg text-white font-bold mb-4">$25/month</p>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                        Choose Plan
                    </button>
                </div>
                
                {/* Premium Plan Card */}
                <div className="w-full sm:w-[300px] md:w-[350px] lg:w-[400px] xl:w-[450px] h-auto py-6 px-4 rounded-xl logincard shadow-lg">
                    <h2 className="text-xl text-white font-semibold mb-4">Premium Plan</h2>
                    <p className="text-white mb-4">For advanced features and large teams.</p>
                    <ul className="list-disc list-inside mb-4 text-white">
                        <li>Unlimited Projects</li>
                        <li>100 GB Storage</li>
                        <li>24/7 Support</li>
                        <li>Advanced Analytics</li>
                    </ul>
                    <p className="text-lg text-white font-bold mb-4">$50/month</p>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                        Choose Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
