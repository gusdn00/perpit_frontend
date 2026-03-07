import React from 'react';
import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import Mainscreen from './pages/Mainscreen'
import Header from './pages/Header'
import Sidebar from './pages/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Mypage from './pages/Mypage';
import ModifyInfo from './pages/ModifyInfo';
import ModifyPw from './pages/ModifyPw';
import FileUpload from './pages/FileUpload';
import ConvertingPage from './pages/ConvertingPage';
import SheetCompletePage from './pages/SheetCompletePage';
import MySheetsPage from './pages/MySheetsPage';
import SheetViewerPage from './pages/SheetViewerPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import PaymentFail from './pages/PaymentFail';
import KakaoCallback from './pages/KakaoCallback';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <>
      <Router>
        <Sidebar />
        <Header />
          <Routes>
            <Route path="/" element={<Mainscreen />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/signup" element={<Signup />}/>
            <Route path="/mypage" element={<Mypage/>}/>
            <Route path="/modify-info" element={<ModifyInfo/>}/>
            <Route path="/modify-pw" element={<ModifyPw/>}/>
            <Route path="/file-upload" element={<FileUpload/>}/>
            <Route path="/converting" element={<ConvertingPage/>}/>
            <Route path="/sheet-complete" element={<SheetCompletePage/>}/>
            <Route path="/mysheets" element={<MySheetsPage/>}/>
            <Route path="/sheet-viewer" element={<SheetViewerPage/>}/>
            <Route path="/payment" element={<PaymentPage/>}/>
            <Route path="/payment/success" element={<PaymentSuccess/>}/>
            <Route path="/payment/cancel" element={<PaymentCancel/>}/>
            <Route path="/payment/fail" element={<PaymentFail/>}/>
            <Route path="/auth/kakao/callback" element={<KakaoCallback/>}/>
          </Routes>
      </Router>
    </>
  )
}

export default App
