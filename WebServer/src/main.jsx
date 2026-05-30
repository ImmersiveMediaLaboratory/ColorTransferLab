/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './index.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { SelectionProvider } from '@/contexts/SelectionContext.jsx'
import { SelectionProviderUserStudy } from '@/contexts/SelectionContextUserStudy.jsx'
import { WarningProvider } from '@/contexts/WarningContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
      <BrowserRouter>
      <WarningProvider>
        <SelectionProviderUserStudy>
            <SelectionProvider>
                <App />
            </SelectionProvider>
        </SelectionProviderUserStudy>
        </WarningProvider>
      </BrowserRouter>
    // </React.StrictMode>,
)
