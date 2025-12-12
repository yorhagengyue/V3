import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed data...')

  // Create users
  console.log('Creating test users...')
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@example.com',
    },
  })

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@example.com',
    },
  })

  console.log(`  Users created: ${alice.username}, ${bob.username}`)

  // Create project with Every.org integration
  console.log('Creating canvas project...')
  const project = await prisma.project.upsert({
    where: { id: 'project-rainforest-001' },
    update: {},
    create: {
      id: 'project-rainforest-001',
      title: 'Save the Amazon Rainforest',
      description: 'Rainforest Trust saves endangered wildlife and protects our planet through partnerships, community engagement and donor support. Join us in creating pixel art to show your support!',
      everyorgSlug: 'rainforest-trust',
      everyorgLogoUrl: 'https://res.cloudinary.com/everydotorg/image/upload/c_lfill,w_24,h_24,dpr_2/c_crop,ar_24:24/q_auto,f_auto,fl_progressive/faja_profile/mnjumjnjm1w43frntqet',
      everyorgCoverUrl: 'https://res.cloudinary.com/everydotorg/image/upload/f_auto,c_limit,w_3840,q_80/profile_pics/wdkbcyjxunm5vy0gzu1a',
      targetAmount: 10000,
      amountRaised: 100,
      gridSize: 100,
      pixelsTotal: 10000,
      status: 'ACTIVE',
    },
  })

  console.log(`  Project created: ${project.title}`)

  // Create color palette - 16 color rainforest theme
  console.log('Creating color palette...')
  const palette = await prisma.colorPalette.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      name: 'Rainforest',
      colors: JSON.stringify([
        '#ffffff', // White
        '#e8f5e9', // Light green
        '#a5d6a7', // Medium green
        '#66bb6a', // Green
        '#43a047', // Dark green
        '#2e7d32', // Forest green
        '#1b5e20', // Very dark green
        '#8d6e63', // Light brown
        '#6d4c41', // Brown
        '#5d4037', // Dark brown
        '#81d4fa', // Light blue
        '#4fc3f7', // Blue
        '#039be5', // Dark blue
        '#ffd54f', // Yellow
        '#ff6f00', // Orange
        '#212121', // Black
      ]),
    },
  })

  console.log(`  Color palette created: ${palette.name}`)

  // Allocate tokens to users
  console.log('Allocating tokens...')
  const aliceTokens = await prisma.userTokens.upsert({
    where: {
      userId_projectId: {
        userId: alice.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: alice.id,
      projectId: project.id,
      balance: 50,
      totalEarned: 50,
      totalDonated: 50,
    },
  })

  const bobTokens = await prisma.userTokens.upsert({
    where: {
      userId_projectId: {
        userId: bob.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: bob.id,
      projectId: project.id,
      balance: 30,
      totalEarned: 50,
      totalSpent: 20,
      totalDonated: 50,
      pixelsPlaced: 20,
    },
  })

  console.log(`  ${alice.username}: ${aliceTokens.balance} tokens`)
  console.log(`  ${bob.username}: ${bobTokens.balance} tokens`)

  // Create donation records
  console.log('Creating donation records...')
  await prisma.donation.create({
    data: {
      projectId: project.id,
      userId: alice.id,
      amount: 50,
      pixelsAwarded: 50,
      message: 'Adding green to our planet!',
      isSimulated: true,
      status: 'SUCCESS',
    },
  })

  await prisma.donation.create({
    data: {
      projectId: project.id,
      userId: bob.id,
      amount: 50,
      pixelsAwarded: 50,
      message: 'Protecting rainforests is everyone\'s responsibility',
      isSimulated: true,
      status: 'SUCCESS',
    },
  })

  console.log('  Created 2 donation records')

  // Create sample pixels - draw a small tree
  console.log('Drawing sample pixels...')
  const treePixels = [
    // Trunk
    { x: 50, y: 60, color: '#6d4c41', userId: alice.id, userName: alice.username, message: 'Tree trunk' },
    { x: 50, y: 61, color: '#6d4c41', userId: alice.id, userName: alice.username, message: 'Tree trunk' },
    { x: 50, y: 62, color: '#5d4037', userId: alice.id, userName: alice.username, message: 'Tree roots' },
    // Canopy
    { x: 49, y: 58, color: '#43a047', userId: bob.id, userName: bob.username, message: 'Leaves' },
    { x: 50, y: 58, color: '#43a047', userId: bob.id, userName: bob.username, message: 'Leaves' },
    { x: 51, y: 58, color: '#43a047', userId: bob.id, userName: bob.username, message: 'Leaves' },
    { x: 49, y: 59, color: '#2e7d32', userId: bob.id, userName: bob.username, message: 'Leaves' },
    { x: 50, y: 59, color: '#66bb6a', userId: alice.id, userName: alice.username, message: 'Leaves' },
    { x: 51, y: 59, color: '#2e7d32', userId: bob.id, userName: bob.username, message: 'Leaves' },
    // Grass
    { x: 48, y: 63, color: '#a5d6a7', userId: alice.id, userName: alice.username, message: 'Grass' },
    { x: 49, y: 63, color: '#a5d6a7', userId: bob.id, userName: bob.username, message: 'Grass' },
    { x: 51, y: 63, color: '#a5d6a7', userId: alice.id, userName: alice.username, message: 'Grass' },
    { x: 52, y: 63, color: '#a5d6a7', userId: bob.id, userName: bob.username, message: 'Grass' },
    // Sky
    { x: 48, y: 56, color: '#81d4fa', userId: bob.id, userName: bob.username, message: 'Sky' },
    { x: 49, y: 56, color: '#81d4fa', userId: alice.id, userName: alice.username, message: 'Sky' },
    { x: 50, y: 56, color: '#4fc3f7', userId: bob.id, userName: bob.username, message: 'Sky' },
    { x: 51, y: 56, color: '#81d4fa', userId: alice.id, userName: alice.username, message: 'Sky' },
    { x: 52, y: 56, color: '#81d4fa', userId: bob.id, userName: bob.username, message: 'Sky' },
    // Sun
    { x: 46, y: 54, color: '#ffd54f', userId: alice.id, userName: alice.username, message: 'Sun' },
    { x: 47, y: 54, color: '#ffd54f', userId: bob.id, userName: bob.username, message: 'Sun' },
  ]

  let pixelCount = 0
  for (const tp of treePixels) {
    await prisma.pixel.create({
      data: {
        projectId: project.id,
        positionX: tp.x,
        positionY: tp.y,
        color: tp.color,
        contributorId: tp.userId,
        contributorName: tp.userName,
        contributorMessage: tp.message,
      },
    })
    pixelCount++
  }

  console.log(`  Created ${pixelCount} pixels`)

  // 更新项目统计
  await prisma.project.update({
    where: { id: project.id },
    data: {
      pixelsPlaced: pixelCount,
      uniquePixels: pixelCount,
      totalContributors: 2,
    },
  })

  // Create achievements
  console.log('Creating achievement system...')
  await prisma.achievement.createMany({
    data: [
      {
        code: 'first_pixel',
        title: 'First Stroke',
        description: 'Place your first pixel',
        tokenReward: 1,
        criteria: JSON.stringify({ pixelsPlaced: 1 }),
      },
      {
        code: 'artist',
        title: 'Artist',
        description: 'Place 100 pixels',
        tokenReward: 10,
        criteria: JSON.stringify({ pixelsPlaced: 100 }),
      },
      {
        code: 'generous',
        title: 'Generous Heart',
        description: 'Reach $100 in total donations',
        tokenReward: 10,
        criteria: JSON.stringify({ totalDonated: 100 }),
      },
      {
        code: 'forest_guardian',
        title: 'Forest Guardian',
        description: 'Place 50 green pixels on the rainforest canvas',
        tokenReward: 15,
        criteria: JSON.stringify({ greenPixels: 50 }),
      },
    ],
  })

  console.log('  Created 4 achievements')

  console.log('\nSeed data created successfully!')
  console.log('\nData overview:')
  console.log(`  - Users: 2`)
  console.log(`  - Projects: 1`)
  console.log(`  - Pixels: ${pixelCount}`)
  console.log(`  - Color palette: 16 colors`)
  console.log(`  - Achievements: 4`)
}

main()
  .catch((e) => {
    console.error('Seed data error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

