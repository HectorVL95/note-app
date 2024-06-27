'use client'

import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, FormControl, IconButton } from "@mui/material";
import { FaRegSave } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { TbHttpDelete } from "react-icons/tb";
import { IoMdAdd } from "react-icons/io";
import { addDoc, getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../server/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";



const Dashboard = () => {
  
  const [notes, setNotes] = useState({title: '', body: ''})
  const [user, setUser] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [editSavedNote, setEditSavedNote] = useState(false)
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged (auth, (user) => {
      if (user) {
        setUser(user);
        getNoteList(user.uid);
      } else {
        setUser(null),
        setNoteList([])
      }
    })
  }, [])

  const getNoteList = async (uid) => {
    try{
      const userNotesCollectionRef = collection(db, 'user', uid, 'notes')
      const notesSnapshop = await getDocs(userNotesCollectionRef)
      const notes = notesSnapshop.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setNoteList(notes)
    }
    catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    try {
      if (user) {
        const userNotesCollectionRef = collection(db, 'user', user.uid, 'notes');
        const docRef = await addDoc(userNotesCollectionRef, notes)
        const newNote = { id: docRef.id, ...notes}
        setNoteList(prevNotes => [...prevNotes, newNote]);
        setNotes({ title: '', body: ''});
      } else{
        console.error('User not logged in')
      }
      
    }
    catch (err) {
      console.error(err)
    }
  }

  const saveEdit = async () => {
    try {
      console.log('saving edit');
    } 
    catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try{
      if (user) {
        const docRef = doc(db, 'user', user.uid, 'notes', id);
        await deleteDoc(docRef);
        console.log(`Deleted note wih id ${id}`)
        setNoteList(prevNotes => prevNotes.filter(note => note.id !== id));
      } else {
        console.error('user not logged in');
      }
    } catch (err) {
      console.error('Error deleting note', err);
    }
  }

  const handleLogOut = () => {
    signOut(auth).then(() => {
      router.push('/')
    })
  }

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
              <IconButton onClick={() => setNotes({title: '', body: ''})} >
                <TbHttpDelete />
              </IconButton>
              
            </Box>
            <TextField onChange={(e) => setNotes({...notes, title: e.target.value})}/>
            <TextField onChange={(e) => setNotes({...notes, body: e.target.value})}/>
          </FormControl>
          <Button variant="contained" onClick={handleLogOut}>Log Out</Button>
        </Box>
        {
          editSavedNote ? 
          
          <Box>
          <FormControl>
            <Box component="div" className="flex gap-4">
              <IconButton onClick={saveEdit}>
                <FaRegSave onClick={ () => setEditSavedNote(false)} />
              </IconButton>
              <IconButton>
                <TbHttpDelete />
              </IconButton>
              
            </Box>
            <TextField onChange={(e) => setNotes({...notes, title: e.target.value})}/>
            <TextField onChange={(e) => setNotes({...notes, body: e.target.value})}/>
          </FormControl>
        </Box>

          
          : 

          noteList.map(data => 
          <Box>
            <Box className="flex">
              <IconButton onClick={() =>  setEditSavedNote(true)}>
                <MdOutlineEdit/> 
              </IconButton>
              <IconButton onClick={()=> handleDelete(data.id)}>
                <FaTrashAlt/> 
              </IconButton>
            </Box>
            <Box>{data.title}</Box>
            <Box>{data.body}</Box>
          </Box>
          )
        }
      </Box>

    </Box>
  );
}

export default Dashboard;