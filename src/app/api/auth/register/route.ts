import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const todayStr = new Date().toISOString().split("T")[0];

    // Create user with welcome bonus points
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        points: 50, // Welcome signup bonus!
        level: 1,
        streak: 1,
        lastActiveDate: todayStr,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! You received +50 Welcome XP.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        level: user.level,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
