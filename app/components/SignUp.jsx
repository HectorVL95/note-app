'use client'

import { Box, Typography, Button, TextField, FormControl, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { auth } from '@/app/server/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";


const SignUp = () => {

 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('')
 const router = useRouter();
 const [openSnack, setOpenSnack]= useState(false)

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
      console.log('exito');
    } catch (err) {
      console.error('escribe un email y contraseña correctos', err)
      setOpenSnack(true)
    }
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
  }


  return (
    <Box component="div" className="flex flex-col gap-8 justify-center items-center">
      <Box component="div">
        <Typography variant="h1" className="text-center">NOTE APP</Typography>
        <Typography variant="body2" className="text-center">Create your Account</Typography>
      </Box>
      <FormControl className="flex flex-col gap-4">
        <TextField
          type="email"
          name="email"
          placeholder="Input email...."
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          type="password"
          name="password"
          placeholder="Input password...."
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" onClick={handleSignUp}>Create Account</Button>
      </FormControl>
      <Snackbar
        autoHideDuration={5000}
        open={openSnack}
        onClose={handleSnackClose}
      >
        <Alert
          severity="warning"
          onClose={handleSnackClose}
        >
          Escribe un email y contraseña
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SignUp;