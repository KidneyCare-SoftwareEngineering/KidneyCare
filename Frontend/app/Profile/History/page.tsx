"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/Components/Navbar";
import ProfileHistory from "@/Components/ProfileHistory";
import { Icon } from "@iconify/react/dist/iconify.js";
import Profile from "../page";

export default function History() {
  return (
    <section>
      <Navbar />
      <ProfileHistory />
    </section>
  );
}
