'use client'

import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, FormControl, IconButton } from "@mui/material";
import { FaRegSave } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { TbHttpDelete } from "react-icons/tb";
import { IoMdAdd } from "react-icons/io";
import { TiDelete } from "react-icons/ti";
import { addDoc, getDocs, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../server/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, list, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../server/firebase";
import { v4 } from "uuid";

const Dashboard = () => {
  
  const [notes, setNotes] = useState({ title: '', body: '' });
  const [user, setUser] = useState(null);
  const [noteList, setNoteList] = useState([]);
  const [editSavedNote, setEditSavedNote] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const router = useRouter();

  const imagesListRef = ref(storage, "images/");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        getNoteList(user.uid);
      } else {
        setUser(null);
        setNoteList([]);
      }
    });

    list(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  const getNoteList = async (uid) => {
    try {
      const userNotesCollectionRef = collection(db, 'user', uid, 'notes');
      const notesSnapshot = await getDocs(userNotesCollectionRef);
      const notes = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNoteList(notes);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSave = async () => {
    try {
      if (user) {
        const userNotesCollectionRef = collection(db, 'user', user.uid, 'notes');

        let imageUrl = '';
        if (imageUpload) {
          const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
          await uploadBytes(imageRef, imageUpload);
          imageUrl = await getDownloadURL(imageRef);
        }
        const newNote = { ...notes, imageUrl };
        const docRef = await addDoc(userNotesCollectionRef, newNote);
        setNoteList(prevNotes => [...prevNotes, { id: docRef.id, ...newNote }]);
        setNotes({ title: '', body: '' });
        setImageUpload(null);
      } else {
        console.error('User not logged in');
      }
    } catch (err) {
      console.error(err);
    }
  }

  const deletePic = async (id, imageUrl) => {
    try {
      if (!user) {
        console.error('User not logged in');
        return;
      }

      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      console.log('Deleted Successfully');

      // Update the note state to remove the imageUrl
      const docRef = doc(db, 'user', user.uid, 'notes', id);
      await updateDoc(docRef, { imageUrl: '' });
      setNoteList(prevNotes => prevNotes.map(note =>
        note.id === id ? { ...note, imageUrl: '' } : note
      ));
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  const saveEdit = async (id, updatedNote) => {
    try {
      if (user) {
        const docRef = doc(db, 'user', user.uid, 'notes', id);
        await updateDoc(docRef, updatedNote);
        setNoteList(prevNotes => prevNotes.map(note => note.id === id ? { ...note, ...updatedNote } : note));
        setEditSavedNote(null);
      } else {
        console.error('User not logged in');
      }
    } catch (err) {
      console.error('Error updating note', err);
    }
  }

  const handleDelete = async (id, imageUrl) => {
    try {
      if (user) {
        const docRef = doc(db, 'user', user.uid, 'notes', id);
        await deleteDoc(docRef);
        if (imageUrl) {
          await deletePic(id, imageUrl);
        }
        console.log(`Deleted note with id ${id}`);
        setNoteList(prevNotes => prevNotes.filter(note => note.id !== id));
      } else {
        console.error('User not logged in');
      }
    } catch (err) {
      console.error('Error deleting note', err);
    }
  }

  const handleLogOut = () => {
    signOut(auth).then(() => {
      router.push('/');
    });
  }

  const clearNotes = () => {
    console.log('Clearing notes');
    setNotes({ title: '', body: '' });
  };

  return (
    <Box component="div" className="flex flex-col">
      <Typography variant="h1" className="text-center">DashBoard</Typography>
      <Box component="div" className="flex justify-evenly">
        <Box>
          <FormControl>
            <Box component="div" className="flex gap-4">
              <IconButton onClick={handleSave}>
                <IoMdAdd />
              </IconButton>
              <IconButton onClick={clearNotes}>
                <TbHttpDelete />
              </IconButton>
            </Box>
            <TextField
              onChange={(e) => setNotes({ ...notes, title: e.target.value })}
              value={notes.title}
            />
            <TextField
              onChange={(e) => setNotes({ ...notes, body: e.target.value })}
              value={notes.body}
            />
            <input type="file" onChange={(e) => {
              setImageUpload(e.target.files[0]);
            }} />
          </FormControl>
          <Button variant="contained" onClick={handleLogOut}>Log Out</Button>
        </Box>
        {noteList.map(data =>
          <Box key={data.id} className="flex flex-col">
            <Box className="flex">
              {editSavedNote === data.id ?
                <IconButton onClick={() => saveEdit(data.id, { title: data.title, body: data.body })}>
                  <FaRegSave />
                </IconButton>
                :
                <IconButton onClick={() => setEditSavedNote(data.id)}>
                  <MdOutlineEdit />
                </IconButton>
              }
              <IconButton onClick={() => handleDelete(data.id, data.imageUrl)}>
                <FaTrashAlt />
              </IconButton>
            </Box>
            {editSavedNote === data.id ?
              <>
                <TextField
                  onChange={(e) => setNoteList(prevNotes => prevNotes.map(note => note.id === data.id ? { ...note, title: e.target.value } : note))}
                  value={data.title}
                  placeholder="Title"
                />
                <TextField
                  onChange={(e) => setNoteList(prevNotes => prevNotes.map(note => note.id === data.id ? { ...note, body: e.target.value } : note))}
                  value={data.body}
                  placeholder="Body"
                />
                {data.imageUrl &&
                  <Box component="div">
                    <>
                      <IconButton onClick={() => deletePic(data.id, data.imageUrl)}>
                        <TiDelete />
                      </IconButton>
                      <img src={data.imageUrl} alt="Note Image" />
                    </>
                  </Box>
                }
              </>
              :
              <>
                <Box>{data.title}</Box>
                <Box>{data.body}</Box>
                {data.imageUrl && (
                  <Box component="div">
                    <img src={data.imageUrl} alt="Note Image" />
                  </Box>
                )}
              </>
            }
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
