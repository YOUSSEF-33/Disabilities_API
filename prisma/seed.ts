import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting seeding process...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: "admin@disabilities.com" },
        update: {},
        create: {
            email: "admin@disabilities.com",
            phoneNumber: "0000000000",
            firstName: "Super",
            lastName: "Admin",
            username: "admin",
            password: hashedPassword,
            isAdmin: true,
        },
    });
    console.log("✅ Users created.");

    const user1 = await prisma.user.upsert({
        where: { email: "ali@example.com" },
        update: {},
        create: {
            email: "ali@example.com",
            phoneNumber: "01122334455",
            firstName: "Ali",
            lastName: "Hassan",
            username: "ali_h",
            password: hashedPassword,
            disabilityType: "PHYSICAL",
            disabilityDetails: "Uses a wheelchair",
        },
    });

    const volunteer1 = await prisma.user.upsert({
        where: { email: "sara@volunteer.com" },
        update: {},
        create: {
            email: "sara@volunteer.com",
            phoneNumber: "01555667788",
            firstName: "Sara",
            lastName: "Ahmed",
            username: "sara_v",
            password: hashedPassword,
            isVolunteer: true,
        },
    });

    // 2. Create Volunteer Profile
    await prisma.volunteerProfile.upsert({
        where: { userId: volunteer1.id },
        update: {},
        create: {
            userId: volunteer1.id,
            skills: ["Sign Language", "First Aid"],
            bio: "Passionate about helping others and making the world more accessible.",
            isAvailable: true,
        },
    });

    // 3. Create Tags
    const mobilityTag = await prisma.tag.upsert({ where: { name: "Mobility" }, update: {}, create: { name: "Mobility" } });
    const educationTag = await prisma.tag.upsert({ where: { name: "Education" }, update: {}, create: { name: "Education" } });
    console.log("✅ Tags created.");

    // 4. Create Resources
    await prisma.resource.create({
        data: {
            title: "Accessible Egypt Guide",
            description: "A comprehensive guide to accessible tourist spots in Egypt.",
            category: "Travel",
            createdById: admin.id,
            tags: { connect: [{ id: mobilityTag.id }] },
        },
    });

    // 5. Create Locations & Features
    const library = await prisma.location.create({
        data: {
            name: "National Library of Egypt",
            address: "Bulaq, Cairo",
            latitude: 30.0626,
            longitude: 31.2285,
            features: {
                create: [
                    { type: "Ramp", description: "Main entrance has a smooth ramp.", rating: 5 },
                    { type: "Elevator", description: "Wide elevator for all floors.", rating: 4 },
                ],
            },
        },
    });

    // 6. Create Badges
    const firstHelpBadge = await prisma.badge.upsert({
        where: { name: "First Help" },
        update: {},
        create: { name: "First Help", description: "Awarded for completing your first service request." },
    });

    // 7. Emergency Contacts
    await prisma.emergencyContact.create({
        data: {
            name: "Emergency Friend",
            phoneNumber: "01009988776",
            userId: user1.id,
        },
    });

    console.log("✅ Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
