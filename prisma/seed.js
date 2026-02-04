const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
        10
    );

    const admin = await prisma.user.upsert({
        where: { email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@rms.com' },
        update: {},
        create: {
            name: 'System Administrator',
            email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@rms.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log(' Created admin user:', admin.email);

    // Create sample users
    const employee = await prisma.user.upsert({
        where: { email: 'employee@rms.com' },
        update: {},
        create: {
            name: 'John Doe',
            email: 'employee@rms.com',
            password: await bcrypt.hash('Employee@123', 10),
            role: 'EMPLOYEE',
        },
    });

    const student = await prisma.user.upsert({
        where: { email: 'student@rms.com' },
        update: {},
        create: {
            name: 'Jane Smith',
            email: 'student@rms.com',
            password: await bcrypt.hash('Student@123', 10),
            role: 'STUDENT',
        },
    });

    console.log('✅ Created sample users');

    // Create resource types
    const classroom = await prisma.resourceType.upsert({
        where: { typeName: 'Classroom' },
        update: {},
        create: { typeName: 'Classroom' },
    });

    const lab = await prisma.resourceType.upsert({
        where: { typeName: 'Computer Lab' },
        update: {},
        create: { typeName: 'Computer Lab' },
    });

    const auditorium = await prisma.resourceType.upsert({
        where: { typeName: 'Auditorium' },
        update: {},
        create: { typeName: 'Auditorium' },
    });

    const meetingRoom = await prisma.resourceType.upsert({
        where: { typeName: 'Meeting Room' },
        update: {},
        create: { typeName: 'Meeting Room' },
    });

    console.log('✅ Created resource types');

    // Create buildings
    const buildingA = await prisma.building.create({
        data: {
            buildingName: 'Main Building',
            buildingNumber: 'A',
            totalFloors: 5,
        },
    });

    const buildingB = await prisma.building.create({
        data: {
            buildingName: 'Science Block',
            buildingNumber: 'B',
            totalFloors: 4,
        },
    });

    console.log('✅ Created buildings');

    // Create resources with facilities
    const resource1 = await prisma.resource.create({
        data: {
            resourceName: 'Room 101',
            resourceTypeId: classroom.id,
            buildingId: buildingA.id,
            floorNumber: 1,
            description: 'Large classroom with modern amenities',
            facilities: {
                create: [
                    { facilityName: 'Projector', details: 'HD Projector with HDMI' },
                    { facilityName: 'Air Conditioning', details: 'Central AC' },
                    { facilityName: 'Whiteboard', details: 'Smart whiteboard' },
                ],
            },
        },
    });

    const resource2 = await prisma.resource.create({
        data: {
            resourceName: 'Computer Lab 1',
            resourceTypeId: lab.id,
            buildingId: buildingB.id,
            floorNumber: 2,
            description: 'Computer lab with 50 workstations',
            facilities: {
                create: [
                    { facilityName: 'Computers', details: '50 Dell workstations' },
                    { facilityName: 'Projector', details: '4K Projector' },
                    { facilityName: 'Air Conditioning', details: 'Central AC' },
                    { facilityName: 'Network', details: 'High-speed WiFi and LAN' },
                ],
            },
        },
    });

    const resource3 = await prisma.resource.create({
        data: {
            resourceName: 'Main Auditorium',
            resourceTypeId: auditorium.id,
            buildingId: buildingA.id,
            floorNumber: 1,
            description: 'Large auditorium for events and seminars',
            facilities: {
                create: [
                    { facilityName: 'Seating', details: 'Capacity: 500 people' },
                    { facilityName: 'Sound System', details: 'Professional PA system' },
                    { facilityName: 'Projector', details: 'Large format projector' },
                    { facilityName: 'Stage', details: 'Professional stage with lighting' },
                    { facilityName: 'Air Conditioning', details: 'Central AC' },
                ],
            },
        },
    });

    console.log('✅ Created resources with facilities');

    // Create sample maintenance records
    await prisma.maintenance.createMany({
        data: [
            {
                resourceId: resource1.id,
                maintenanceType: 'Cleaning',
                scheduledDate: new Date('2026-02-05'),
                status: 'SCHEDULED',
                notes: 'Regular cleaning scheduled',
            },
            {
                resourceId: resource2.id,
                maintenanceType: 'Equipment Check',
                scheduledDate: new Date('2026-02-06'),
                status: 'SCHEDULED',
                notes: 'Check all computers and network equipment',
            },
            {
                resourceId: resource3.id,
                maintenanceType: 'Sound System Maintenance',
                scheduledDate: new Date('2026-02-07'),
                status: 'SCHEDULED',
                notes: 'Annual sound system servicing',
            },
        ],
    });

    console.log('✅ Created maintenance records');

    // Create sample bookings
    await prisma.booking.createMany({
        data: [
            {
                resourceId: resource1.id,
                userId: employee.id,
                startDatetime: new Date('2026-02-05T09:00:00'),
                endDatetime: new Date('2026-02-05T11:00:00'),
                status: 'APPROVED',
                approverId: admin.id,
                purpose: 'Department meeting',
            },
            {
                resourceId: resource2.id,
                userId: student.id,
                startDatetime: new Date('2026-02-06T14:00:00'),
                endDatetime: new Date('2026-02-06T16:00:00'),
                status: 'PENDING',
                purpose: 'Programming workshop',
            },
        ],
    });

    console.log('✅ Created sample bookings');

    // Create cupboards and shelves
    await prisma.cupboard.create({
        data: {
            resourceId: resource1.id,
            cupboardName: 'Storage Cupboard A',
            totalShelves: 5,
            shelves: {
                create: [
                    { shelfNumber: 1, capacity: 20, description: 'Books and materials' },
                    { shelfNumber: 2, capacity: 15, description: 'Teaching aids' },
                    { shelfNumber: 3, capacity: 25, description: 'Stationery' },
                    { shelfNumber: 4, capacity: 20, description: 'Equipment' },
                    { shelfNumber: 5, capacity: 10, description: 'Archive' },
                ],
            },
        },
    });

    console.log('✅ Created cupboards and shelves');

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
