import React, { useState, useEffect } from 'react';
import { db } from '../../pages/Firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useAdminFlag } from '../../context/AdminFlagContext';


const FriendsEventModal = ({ isOpen, onClose, selectedDate }) => { // selectedDateをプロパティとして受け取る
  const [omimaiEvents, setOmimaiEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [selectedTime, setSelectedTime] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const { uid,tail } = useAdminFlag(); // <-- useAdminFlagで取得
  const [adminData, setAdminData] = useState([]); // adminUidsではなくadminDataとした


  const generateFullText = () => {
    return `${selectedTime} に伺います。${additionalComment}`;
  };


  useEffect(() => {
    console.log("isOpen value: ", isOpen);
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const fetchOmimaiEvents = async () => {
      try {
        // 日付とお見舞いのフラグでフィルタリング
        const q = query(
          collection(db, 'schedules'),
          where('date', '==', selectedDate),
          where('omimai', '==', 'on'),
        );

        const querySnapshot = await getDocs(q);
        const fetchedEvents = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          fetchedEvents.push({
            date: data.date,
            startTime: data['o-time'] ? data['o-time'].split('-')[0] : '',
            endTime: data['o-time'] ? data['o-time'].split('-')[1] : '',
            place: data['o-place'],
            comment: data['o-comment'],
            tail: data.tail
          });
        });
        console.log("Fetched events: ", fetchedEvents);
        setOmimaiEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching omimai events:', error);
      }
    };

    if (isOpen) {
      fetchOmimaiEvents();
    }
  }, [isOpen, selectedDate]); // selectedDateを依存配列に追加


  useEffect(() => {
    const fetchAdmins = async () => {
      const q = query(
        collection(db, 'users'),
        where('tail', '==', tail),
        where('adminFlag', 'in', [0, 1])
      );
  
      const querySnapshot = await getDocs(q);
      const fetchedUids = [];
      querySnapshot.forEach((doc) => {
        fetchedUids.push(doc.id);
      });
      setAdminData(fetchedUids);
    };
    
    fetchAdmins();
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem(`selectedTime_${selectedDate}`, selectedTime);
    localStorage.setItem(`additionalComment_${selectedDate}`, additionalComment);
  };
  

  useEffect(() => {
    const savedTime = localStorage.getItem(`selectedTime_${selectedDate}`);
    const savedComment = localStorage.getItem(`additionalComment_${selectedDate}`);
    
    if (savedTime) setSelectedTime(savedTime);
    if (savedComment) setAdditionalComment(savedComment);
  }, [selectedDate]);  // selectedDateが変更されたときにも実行
  

  const handleSave = async () => {
    const fullText = generateFullText();
    console.log("Full text to be saved:", fullText);
    // Firestoreに保存するデータのオブジェクト
   const newMessage = {
    format: 'individual',
    recipientId: adminData,
    senderId: uid,  // 本人のUIDを適切に設定
    text: fullText,
    timestamp: new Date(),  // 現在時刻を設定
    title: 'お見舞い予約'
  };
  console.log('adminData',adminData)

  try {
    // messagesコレクションにデータを追加
    await addDoc(collection(db, 'messages'), newMessage);
    console.log("Message saved successfully.");
  } catch (error) {
    console.error("Error saving message: ", error);
  }
  saveToLocalStorage();
};


  return (
    <div>
      {isOpen && (  // ← isOpenがtrueの時だけ以下の要素を表示
      <div className={isModalOpen ? 'eventModal open' : 'eventModal'}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>お見舞い{omimaiEvents.length > 0 ? 'OK' : 'NG'}</h2>
        <ul>
          {omimaiEvents.map((event, index) => (
            <li key={index}>
              {event.date}<br/>
               時間: {event.startTime} - {event.endTime}<br/>
              場所: {event.place},<br/>
              コメント: {event.comment}
            </li>
          ))}
        </ul>
        <div className='appointmentArea'>
        {/* ここから入力フォームのコード */}
        <h3>お見舞い予約</h3>
        <div >
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
            <label> ごろに伺います。</label>
          </div>
          <textarea
            className="comment-input"
            placeholder="コメントを入力してください"
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
          ></textarea>
          <button onClick={handleSave}>保存</button>
          </div>
      </div>
    )}
    </div>
  );
};

export default FriendsEventModal;


