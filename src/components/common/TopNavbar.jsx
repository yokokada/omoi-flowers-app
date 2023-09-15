import React, { useEffect, useState, useContext  } from 'react';
import './Navbar.css';
import { MoreHoriz } from 'iconoir-react';
import { Flower } from 'iconoir-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../pages/Firebase';  // Firebaseの設定に応じて変更
import { Link, useNavigate } from 'react-router-dom';
import { ColorContext } from '../../App';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { bgColor } = useContext(ColorContext);  
  console.log("bgColor from context:", bgColor);

  useEffect(() => {
    console.log("menuOpen:", menuOpen);
  }, [menuOpen]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log('User signed out');
      navigate('/');  // ここでリダイレクト
    });
  };

  const menuItems = [
    { name: "home", action: "/dashboard" },
    { name: "Talks", action: "/chat" },
    { name: "Calendar", action: "/calendar" },
    { name: "設定", action: "/settings" },
    { name: "お知らせ", action: "/information" },
    { name: "友達招待", action: "/AddMember" },
    { name: "ログアウト", action: "LOG_OUT" }
  ];

  const styles = {
    navbarFixed: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      backgroundColor: `${bgColor}80`, // bgColorを利用してNavbarの背景色を動的に変更
    }
  };

  return (
    <div className="navbar" style={styles.navbarFixed}>
      <div className="left-item">
        <a href="/Notification" className="navbar-item"><Flower fontSize={20} strokeWidth={1} /></a>
      </div>
      
      <div className="center-item">
        <h1 className="navbar-item" style={{ fontWeight: "bold" }}>omoi flowers</h1>
      </div>

      <div className="right-item">
      <div className="navbar-item" onClick={() => {
          setMenuOpen((prevState => !prevState));
          console.log("menuOpen:", menuOpen);  // <-- この行を追加
        }}>
          <MoreHoriz fontSize={20}  strokeWidth={2} />
        </div>
      </div>
      <div className={menuOpen ? 'menu-open' : ''}>
      {menuOpen && (
        <div className="dropdown-menu">
          {menuItems.map((item, index) => {
            if (item.action === "LOG_OUT") {
              return (
                <a 
                  key={index}
                  href="#" 
                  className="dropdown-item" 
                  onClick={handleSignOut}
                >
                  {item.name}
                </a>
              );
            } else {
              return (
                <Link 
                  key={index} 
                  to={item.action} 
                  className="dropdown-item"
                >
                  {item.name}
                </Link>
              );
            }
          })}
        </div>
      )}
    </div>
    </div>
  );
}

