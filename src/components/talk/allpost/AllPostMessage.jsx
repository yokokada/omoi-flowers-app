import React, { useState } from 'react';
import './AllPost.css';
import DisplayMergedData from './DisplayMergedData'; // この行を追加
import {Button} from "@nextui-org/react";
import { db,auth } from '../../../pages/Firebase';
import { getDocs, collection, addDoc, serverTimestamp  } from 'firebase/firestore';



const AllPostMessage = () => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [displayData, setDisplayData] = useState(null);

  const handleTextareaChange = (event) => {
    setMessage(event.target.value);
  };

  const handleMergeClick = () => {
    setDisplayData({
      title,
      imageUrl,
      message
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleBulkSend = async () => {
    const memberQuery = collection(db, 'users');
    const memberSnapshot = await getDocs(memberQuery);
    let memberData = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const formatCurrentDate = () => {
      const currentDate = new Date();
      const formatWithZero = (num) => {
        return num < 10 ? `0${num}` : `${num}`;
      }
    
      return `${currentDate.getFullYear()}-${formatWithZero(currentDate.getMonth() + 1)}-${formatWithZero(currentDate.getDate())}`;
    };
    
    // schedulesコレクションにもデータを追加
    await addDoc(collection(db, 'schedules'), {
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || '',
      date: formatCurrentDate(), // ここでヘルパー関数を使用して日付をフォーマット
      record: 'on',
    });
    for(let member of memberData) {
        await addDoc(collection(db, 'messages'), {
            format: 'all',
            senderId: auth.currentUser.uid,
            recipientId: member.id,
            title: title,
            text: message,
            imageUrl: imageUrl,
            timestamp: new Date()
        });
    }
    // 送信完了後の処理や確認メッセージをここに追加することができます。
    alert('メッセージが一括送信されました！');
};

  return (
    <div className='allMessageCreate'>
    <div className="massageArea">
      <div className="inputGroup">
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="inputTitle"
          placeholder="タイトル"  // この行を追加
        />
        <textarea
          id="description"
          value={message}
          onChange={handleTextareaChange}
          className="inputMessage"
          placeholder="内容"  // この行を追加
        ></textarea>
        <input
          type="file"
          id="image"
          onChange={handleFileChange}
          className="inputImage"
        />
          {/* 選択された画像のプレビュー */}
       {imageUrl && (
        <div className="imagePreview">
          <img src={imageUrl} alt="選択された画像" />
        </div>
      )}
      </div> 
    </div>
    <Button style={{ margin:'20px',backgroundColor:'#1B3672',color:'white' }} onClick={handleMergeClick}>カード作成</Button>
    <DisplayMergedData data={displayData} />
     {/* displayDataが存在する場合のみ一括送信ボタンを表示 */}
     {displayData && (
      <Button style={{ marginTop:'20px',marginBottom:'50px',backgroundColor:'#1B3672',color:'white' }} onClick={handleBulkSend}>一括送信</Button>
    )}

    </div>
  );
}

export default AllPostMessage;
