import { useFormik } from "formik";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  Link,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleLogin = async (values, formik) => {
    try {
      const res = await axios.post(
        "https://chat-app-busd.onrender.com/api/login",
        values
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.log("Login failed:", error);
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
      password: "",
    },
    onSubmit: (values) => {
      handleLogin(values, formik);
    },
    validate: (values) => {
      const errors = {};

      if (!values.email) {
        errors.email = "Email is required";
      }

      if (!values.password) {
        errors.password = "Password is required";
      }

      return errors;
    },
  });

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="90vh">
      <Box
        maxW="sm"
        p="5"
        borderRadius="md"
        boxShadow="md"
        borderWidth="1px"
        bg={colorMode === "dark" ? "#2D3748" : "#FAFAFA"}
      >
        <Text fontSize="1.2rem" mb={3} fontWeight="600" textAlign="center">
          Login
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
            Login
          </Button>
        </form>
        <Box mt="4" textAlign="center" fontSize=".7rem">
          <Text display="inline">Don't have an account?</Text>
          <Link>
            <Text
              display="inline"
              fontWeight="600"
              ml="1"
              onClick={() => navigate("/register")}
            >
              Register
            </Text>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
