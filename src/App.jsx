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

          </Routes>
      </Router>
    </>
  )
}

export default App
