import { useFormik } from "formik";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  Link,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/register",
        values
      );
      toast({
        position: "top-bottom",
        // title: "Error",
        description: res.data.msg,
        status: "success",
        duration: 4000,
      });
      console.log(res);
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        position: "top-bottom",
        // title: "Error",
        description: error.response.data.msg,
        status: "error",
        duration: 4000,
      });
    } finally {
      formik.setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      avatar: "https://bit.ly/broken-link",
    },
    onSubmit: (values) => {
      console.log("Form data:", values);
      handleRegister(values);
    },
    validate: (values) => {
      const errors = {};

      if (!values.email) {
        errors.email = "Email is required";
      }

      if (!values.username) {
        errors.username = "Username is required";
      }

      if (!values.password) {
        errors.password = "Password is required";
      }

      return errors;
    },
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="90vh"
      // border="2px solid red"
    >
      <Box maxW="sm" p="5" borderRadius="md" boxShadow="md" borderWidth="1px">
        <Text fontSize="1.2rem" mb={3} fontWeight="600" textAlign="center">
          Register
        </Text>
        <form onSubmit={formik.handleSubmit}>
          <FormControl
            id="email"
            isInvalid={formik.errors.email && formik.touched.email}
          >
            {/* <FormLabel>Email</FormLabel> */}
            <Input
              type="email"
              placeholder="Email"
              {...formik.getFieldProps("email")}
            />
            <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl
            id="username"
            mt="4"
            isInvalid={formik.errors.username && formik.touched.username}
          >
            {/* <FormLabel>Username</FormLabel> */}
            <Input
              type="text"
              placeholder="Username"
              {...formik.getFieldProps("username")}
            />
            <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl
            id="password"
            mt="4"
            isInvalid={formik.errors.password && formik.touched.password}
          >
            {/* <FormLabel>Password</FormLabel> */}
            <Input
              // type="password"
              type="text"
              {...formik.getFieldProps("password")}
              placeholder="Password"
            />
            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
          </FormControl>

          <Button
            mt="6"
            colorScheme="teal"
            type="submit"
            width="full"
            isLoading={formik.isSubmitting}
          >
            Register
          </Button>
        </form>
        <Box mt="4" textAlign="center" fontSize=".7rem">
          <Text display="inline">Already have an account?</Text>
          <Link>
            <Text
              display="inline"
              fontWeight="600"
              ml="1"
              onClick={() => navigate("/login")}
            >
              Login
            </Text>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
