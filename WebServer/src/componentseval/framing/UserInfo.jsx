/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './UserInfo.scss';
import { useState } from 'react';
import { useWebRTC } from '@/Utils/WebRTCProvider';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** UserInfo component for collecting user information and sending it to the backend before starting the test.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function UserInfo({ userLink, setShowUserInfo }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/     
    const [workerId, setWorkerId] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [nationality, setNationality] = useState('');
    const [vision, setVision] = useState('');

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();

    const NATIONALITIES = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     **
     **************************************************************************************************************/
    const handleSubmit = async (e) => {
        e.preventDefault();
        let data_send = {
            command: "/putUserInfoRequest",
            data: {
                worker_id: workerId,
                test_link: userLink,
                age: age,
                gender: gender,
                nationality: nationality,
                vision: vision,
                start_time: new Date().toISOString(),
            }
        };
        
        console.debug("SEND", "[COMPUTE NODE] Request to apply User Study databases via command /putUserInfoRequest", data_send);
        rtc.sendMessage(JSON.stringify(data_send));

        setShowUserInfo(false);
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="userinfo-container">
            <h2>User Information</h2>
            <p className="userinfo-intro">
                Before you start the test, please provide some information about yourself. This data will be used anonymously for statistical analysis and will not be shared with third parties.
            </p>
            <form onSubmit={handleSubmit}>
                <label>
                    Worker ID:
                    <input type="text" value={workerId} onChange={e => setWorkerId(e.target.value)} required />
                </label>
                <label>
                    Age:
                    <input type="number" min="10" max="120" value={age} onChange={e => setAge(e.target.value)} required />
                </label>
                <label>
                    Gender:
                    <select value={gender} onChange={e => setGender(e.target.value)} required>
                        <option value="" disabled>Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="diverse">Diverse</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                </label>
                <label>
                    Nationality:
                    <select
                        value={nationality}
                        onChange={e => setNationality(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select...</option>
                        {NATIONALITIES.map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Visual impairments (e.g. color blindness):
                    <input type="text" value={vision} onChange={e => setVision(e.target.value)} placeholder="None or describe..." />
                </label>
                <button
                    className={`userinfo-submit-btn start-test-btn`}
                    type="submit"
                >
                    Start Test
                </button>
            </form>
        </div>
    );
}