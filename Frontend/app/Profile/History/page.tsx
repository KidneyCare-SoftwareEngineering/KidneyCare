"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/Components/Navbar";
import ProfileHistory from "@/Components/ProfileHistory";
import SumCalorie from "@/Components/SumCalorie";
import { Icon } from "@iconify/react/dist/iconify.js";
import Profile from "../page";

export default function History() {
  return (
    <section>
      <Navbar />
      <ProfileHistory />
      <SumCalorie />
      <div className="flex justify-center items-center rounded-lg border border-gray-300 bg-white drop-shadow-lg p-2 mx-4 my-6">
        <p className="font-semibold text-gray-800">ประวัติการกิน</p>
      </div>
    </section>
  );
}
