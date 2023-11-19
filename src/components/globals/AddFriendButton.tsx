"use client";

import React, { useState } from "react";
import Button from "./Button";
import { addFriendValidator } from "@/lib/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

type FormData = z.infer<typeof addFriendValidator>;
const AddFriendButton = () => {
  const [success, setSuccess] = useState<boolean>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });
  const addFriend = async (email: string) => {
    console.log("Adding friend");
    try {
      const validatedEmail = addFriendValidator.parse({email});
      if(!validatedEmail){
        throw new Error("Validated Email Problem");
      }
      const response = await axios.post(`/api/friends/add`, {
        email: validatedEmail,
      });
      console.log(response.data);
      setSuccess(true);
      toast.success("Friend Request Sent");
    } catch (error: any) {
        console.log("error occured");
      if (error instanceof z?.ZodError) {
        setError("email", {
          message: error.message,
        });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", {
          message: error.response?.data,
        });
        return;
      }

      setError("email", {
        message: "Something went wrong",
      });
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="font-medium block text-sm leading-6 text-gray-900"
      >
        Add Friend by Email
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm leading-6"
          placeholder="you@example.com"
        />
        <Button>Add</Button>
      </div>

      <p className="mt-1 text-sm text-red-500">{errors.email?.message}</p>
    </form>
  );
};

export default AddFriendButton;
