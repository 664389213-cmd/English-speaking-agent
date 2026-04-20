import { Unit } from './types';

export const UNITS: Unit[] = [
  {
    id: 'unit1',
    title: 'Unit 1: Time to Relax',
    titleCn: '第一单元：放松时刻',
    scenes: [
      {
        id: 'u1-s1',
        title: 'Scene 1: Joining a Hobby Club',
        titleCn: '场景一：加入爱好社团',
        context: 'You are at the school playground. A friendly classmate (AI) is inviting you to join a hobby club. Talk about what you do to relax and explore new interests.',
        contextCn: '在学校操场，一位热情的同学（AI）正邀请你加入爱好社团。聊聊你平时如何放松，以及探讨新的兴趣。',
        targetAwareness: [
          'Talk about hobbies and why you do them.',
          'Decide which club you might like to join.'
        ],
        targetAwarenessCn: [
          '谈论爱好及其目的。',
          '决定想加入哪个社团。'
        ],
        preTaskReview: {
          words: ['calligraphy', 'skiing', 'programming', 'yoga', 'painting', 'stress', 'achievement'],
          phrases: ['in my free time', 'get into', 'reduce stress']
        },
        fixedOpening: "Hi there! I'm so glad we're hanging out at the school playground today. There are so many hobby clubs finding new members. **What do you usually do in your free time to relax?**",
        phases: [
          { name: '1. Breaking the Ice', nameCn: '1. 破冰热身', aiGoal: 'Greet the student and talk about free time activities.', userHint: 'Greet back and say what you usually do after school.' },
          { name: '2. Digging Deeper (Why?)', nameCn: '2. 深入交流 (目的)', aiGoal: 'Ask about the benefits of their hobby. Use "to relax" or "to reduce stress".', userHint: 'Explain why you like the hobby using "to...".' },
          { name: '3. Challenges', nameCn: '3. 面对挑战', aiGoal: 'Ask if they find anything hard or scary about it.', userHint: 'Talk about something difficult you faced while learning.' },
          { name: '4. Club Invitation', nameCn: '4. 社团邀约', aiGoal: 'Share your own club interest and invite them to join together.', userHint: 'Ask about details and agree to go together.' }
        ]
      },
      {
        id: 'u1-s2',
        title: 'Scene 2: Don\'t Give Up!',
        titleCn: '场景二：别放弃！',
        context: 'You are at the ice skating rink. You just fell down and feel like giving up. The AI is your supportive friend who encourages you to keep going.',
        contextCn: '你在滑冰场。你刚才摔倒了，想放弃。AI是你的贴心好友，正鼓励你继续坚持。',
        targetAwareness: [
          'Talk about failure and overcoming fear.',
          'Learn how to give and receive encouragement.'
        ],
        targetAwarenessCn: [
          '谈论失败与克服恐惧。',
          '学习如何给予和接受鼓励。'
        ],
        preTaskReview: {
          words: ['manage', 'instructor', 'scared', 'fear', 'failure'],
          phrases: ['give up', 'scared of', 'get over', 'give it a go']
        },
        fixedOpening: "Oh no! Are you okay? Don't be discouraged just because you fell down here at the ice skating rink. **Do you want to try one more time?**",
        phases: [
          { name: '1. Are you okay?', nameCn: '1. 还好吗？', aiGoal: 'Comfort the user who just failed or fell down.', userHint: 'Express your frustration or fear.' },
          { name: '2. It\'s normal', nameCn: '2. 这很正常', aiGoal: 'Explain that the first step is the hardest and everyone fails at first.', userHint: 'Agree but express how hard it is to manage.' },
          { name: '3. Motivation', nameCn: '3. 寻找动力', aiGoal: 'Remind them of the joy of the activity and the sense of achievement.', userHint: 'Think about why you liked it in the first place.' },
          { name: '4. Try again', nameCn: '4. 再试一次', aiGoal: 'Invite them to stand up and try one more time together.', userHint: 'Listen to the advice and say you will give it a go.' }
        ]
      },
      {
        id: 'u1-s3',
        title: 'Scene 3: My Secret Collection',
        titleCn: '场景三：我的秘密收藏',
        context: 'It\'s Hobby Day in class. You are showing your collection to the AI, a curious classmate who also collects things.',
        contextCn: '班级爱好展示日。你正向AI展示你的收藏，AI是一个对收藏也很感兴趣的好奇同学。',
        targetAwareness: [
          'Introduce your collection.',
          'Share the story behind your hobby and your pride.'
        ],
        targetAwarenessCn: [
          '介绍你的收藏品。',
          '分享爱好背后的故事与自豪感。'
        ],
        preTaskReview: {
          words: ['coin', 'stamp', 'postcard', 'old-fashioned', 'foreign', 'pride'],
          phrases: ['sense of achievement', 'once in a while', 'used to']
        },
        fixedOpening: "Wow, look at all these! It's so cool that you brought your collection for Hobby Day. **What's this character on your postcard? Is it difficult to collect all these?**",
        phases: [
          { name: '1. What\'s this?', nameCn: '1. 这是什么？', aiGoal: 'Express curiosity about the user\'s collection.', userHint: 'Briefly introduce what you are collecting.' },
          { name: '2. The Beginning', nameCn: '2. 收藏之始', aiGoal: 'Ask about how they started this collection.', userHint: 'Tell the story of how you got your first piece.' },
          { name: '3. Meaning & Effort', nameCn: '3. 意义与付出', aiGoal: 'Discuss why they keep doing it and the effort involved.', userHint: 'Explain how much time/effort you spend and why it is worth it.' },
          { name: '4. Sharing Mutual Interests', nameCn: '4. 共享兴趣', aiGoal: 'Praise their collection and share your own dream collection.', userHint: 'Ask about the AI\'s hobbies too.' }
        ]
      }
    ]
  },
  {
    id: 'unit2',
    title: 'Unit 2: Stay Healthy',
    titleCn: '第二单元：保持健康',
    scenes: [
      {
        id: 'u2-s1',
        title: 'Scene 1: At the Doctor\'s Office',
        titleCn: '场景一：在诊诊所',
        context: 'You don\'t feel well today and are visiting the doctor (AI). Describe your symptoms and listen to the doctor\'s advice.',
        contextCn: '你今天感觉不舒服去看医生（AI）。描述你的症状并听取医生的建议。',
        targetAwareness: [
          'Describe illnesses like a sore throat or stomachache.',
          'Understand advice using "should", "shouldn\'t", or "could".'
        ],
        targetAwarenessCn: [
          '描述如喉咙痛或胃痛等疾病。',
          '理解使用 "should" 或 "could" 的建议。'
        ],
        preTaskReview: {
          words: ['sore throat', 'headache', 'stomachache', 'fever', 'medicine'],
          phrases: ['feel terrible', 'take your temperature', 'rest at home']
        },
        fixedOpening: "Hello there. You look very pale and tired today. We are here in the school clinic. **What's the matter with you, and how are you feeling right now?**",
        phases: [
          { name: '1. Symptoms', nameCn: '1. 描述症状', aiGoal: 'Ask "What\'s the matter?" and inquire about how they are feeling.', userHint: 'Describe your illness (e.g., runny nose, fever).' },
          { name: '2. Causes', nameCn: '2. 寻找病因', aiGoal: 'Ask when it started or if they did anything unusual.', userHint: 'Mention a possible cause (e.g., didn\'t wear a jacket).' },
          { name: '3. Diagnosis', nameCn: '3. 医生诊断', aiGoal: 'Tell them what you think the problem is (e.g., "I believe you have the flu.").', userHint: 'Confirm and ask what you should do.' },
          { name: '4. Giving Advice', nameCn: '4. 医嘱建议', aiGoal: 'Give advice using "You should/shouldn\'t..." (drink water, take medicine).', userHint: 'Thank the doctor and promise to follow the advice.' }
        ]
      },
      {
        id: 'u2-s2',
        title: 'Scene 2: A Minor Accident',
        titleCn: '场景二：小意外',
        context: 'You hurt yourself during PE class. The school nurse (AI) is helping you clean the wound. Discuss what happened and how to be careful.',
        contextCn: '你在体育课上受伤了。校医（AI）正在帮你清理伤口。讨论发生的事以及如何小心。',
        targetAwareness: [
          'Talk about minor injuries (bruised knee, cut).',
          'Use reflexive pronouns (cut myself, hurt yourself).'
        ],
        targetAwarenessCn: [
          '讨论轻微伤（擦伤膝盖，划伤）。',
          '使用反身代词。'
        ],
        preTaskReview: {
          words: ['bruised', 'cut', 'nosebleed', 'injury', 'careless'],
          phrases: ['hurt yourself', 'fall off', 'be careful']
        },
        fixedOpening: "Oh dear! You've really hurt yourself. Sit here in the nurse's room while I check your injuries. You have a bruised knee and a cut on your arm. **What happened during PE class?**",
        phases: [
          { name: '1. What happened?', nameCn: '1. 发生何事？', aiGoal: 'Notice the injury and ask how they hurt themselves.', userHint: 'Explain how you fell or got the cut.' },
          { name: '2. Immediate Care', nameCn: '2. 即时处理', aiGoal: 'Offer to clean and cover the wound.', userHint: 'Express a little pain or say thank you.' },
          { name: '3. Precaution Advice', nameCn: '3. 预防建议', aiGoal: 'Advise them to "be more careful next time" to avoid hurting themselves.', userHint: 'Agree and admit you were careless.' },
          { name: '4. Reassurance', nameCn: '4. 安慰鼓励', aiGoal: 'Reassure them that accidents happen and they will be fine.', userHint: 'Express relief and gratitude.' }
        ]
      },
      {
        id: 'u2-s3',
        title: 'Scene 3: Staying Safe at Home',
        titleCn: '场景三：居家安全',
        context: 'You are home alone and accidentally caused a small fire in the kitchen while cooking. You just put it out. You are calling your parent (AI) to tell them what happened.',
        contextCn: '你独自在家做饭时不小心引发了小火灾，刚扑灭。你正打电话给父母（AI）讲述经过。',
        targetAwareness: [
          'Narrate an emergency safely.',
          'Discuss home safety rules and fire prevention.'
        ],
        targetAwarenessCn: [
          '讲述突发状况。',
          '讨论居家安全规则和防火。'
        ],
        preTaskReview: {
          words: ['flame', 'extinguisher', 'burn', 'panic', 'smoke'],
          phrases: ['catch fire', 'put out', 'turn off']
        },
        fixedOpening: "Hello? It's Mom. I'm calling to check on you. **Is everything okay at home? I thought I heard a strange noise in the background!**",
        phases: [
          { name: '1. Breaking the News', nameCn: '1. 告知情况', aiGoal: 'Answer the call and ask if everything is okay.', userHint: 'Tell them there was a small fire but you are safe.' },
          { name: '2. The Detail', nameCn: '2. 讲述细节', aiGoal: 'Act shocked and ask how the fire started.', userHint: 'Explain the cooking mistake (e.g., heating oil too long).' },
          { name: '3. Action Taken', nameCn: '3. 采取行动', aiGoal: 'Ask how you managed to put the fire out.', userHint: 'Describe using a fire extinguisher or turning off the stove.' },
          { name: '4. Safety Lesson', nameCn: '4. 安全教育', aiGoal: 'Praise their quick thinking but remind them of safety rules at home.', userHint: 'Promise to be more careful next time.' }
        ]
      }
    ]
  },
  {
    id: 'unit3',
    title: 'Unit 3: Growing Up',
    titleCn: '第三单元：成长烦恼',
    scenes: [
      {
        id: 'u3-s1',
        title: 'Scene 1: Clearing the Air',
        titleCn: '场景一：消除误会',
        context: 'You had a fight with your best friend (AI) yesterday because they borrowed your book and tore a page. Now, you are meeting them to talk about it.',
        contextCn: '你昨天和最好的朋友（AI）吵架了，因为对方弄坏了你借的信。现在你正和对方沟通。',
        targetAwareness: [
          'Express negative feelings properly (angry, upset).',
          'Learn to apologize and forgive using "although", "until".'
        ],
        targetAwarenessCn: [
          '妥善表达负面情绪。',
          '学习道歉和原谅。'
        ],
        preTaskReview: {
          words: ['angry', 'upset', 'fault', 'forgive', 'hurtful'],
          phrases: ['say sorry', 'clear the air', 'on purpose', 'did not mean to']
        },
        fixedOpening: "Hey... I'm glad we could meet up at school. I know we had that big fight yesterday. I feel really bad about tearing your book. **Can we talk and clear the air?**",
        phases: [
          { name: '1. The Approach', nameCn: '1. 主动接触', aiGoal: 'Greet awkwardly and say you wanted to talk.', userHint: 'Acknowledge the tension and agree to talk.' },
          { name: '2. Stating Feelings', nameCn: '2. 表达感受', aiGoal: 'Apologize for tearing the page and say it wasn\'t on purpose.', userHint: 'Say how upset you were when you saw the damage.' },
          { name: '3. Understanding', nameCn: '3. 尝试理解', aiGoal: 'Explain that you didn\'t realize it was that important until they got angry. Promise to be careful.', userHint: 'Accept the apology, mention your long friendship.' },
          { name: '4. Rebuilding', nameCn: '4. 重归于好', aiGoal: 'Express relief and ask if you are still friends so that you can move on.', userHint: 'Confirm the friendship and move on.' }
        ]
      },
      {
        id: 'u3-s2',
        title: 'Scene 2: Parental Pressure',
        titleCn: '场景二：父母的压力',
        context: 'You feel stressed because your parents have high standards. You are talking to a school counselor (AI) for advice on how to handle it.',
        contextCn: '因为父母要求太高你感到压力很大。你正在和学校心理辅导员（AI）倾诉。',
        targetAwareness: [
          'Talk about stress and parental expectations.',
          'Discuss communication strategies.'
        ],
        targetAwarenessCn: [
          '谈论压力和父母的期望。',
          '讨论沟通策略。'
        ],
        preTaskReview: {
          words: ['stressed', 'worried', 'standards', 'compare', 'pressure'],
          phrases: ['get your message across', 'expect too much', 'in my shoes']
        },
        fixedOpening: "Come in and have a seat. I'm glad you came to the counselor's office today. You look a bit worried. **What's making you feel so stressed lately?**",
        phases: [
          { name: '1. Sharing the Burden', nameCn: '1. 倾吐负担', aiGoal: 'Ask the student what\'s making them feel down.', userHint: 'Share your stress about exams and parents\' high standards.' },
          { name: '2. The Core Issue', nameCn: '2. 核心问题', aiGoal: 'Acknowledge the stress and ask if the parents compare them to others.', userHint: 'Talk about being compared to a cousin or classmate.' },
          { name: '3. Perspective Shift', nameCn: '3. 换位思考', aiGoal: 'Suggest that although parents are strict, they just want the best. Ask if they tried talking.', userHint: 'Explain you are afraid to talk until you get good grades.' },
          { name: '4. Practical Advice', nameCn: '4. 实用建议', aiGoal: 'Advise writing a letter so that the parents know how they feel without arguing.', userHint: 'Think it\'s a good idea and thank the counselor.' }
        ]
      },
      {
        id: 'u3-s3',
        title: 'Scene 3: You Can\'t Win Them All',
        titleCn: '场景三：不可能全赢',
        context: 'Your basketball team just lost an important game because of a mistake you made. Your coach (AI) comes to talk to you while you feel disappointed.',
        contextCn: '你所在的篮球队因为你的失误输掉了一场重要比赛。教练（AI）过来开导失落的你。',
        targetAwareness: [
          'Manage feelings of disappointment and guilt.',
          'Adopt a positive mindset (idioms like "feel blue").'
        ],
        targetAwarenessCn: [
          '管理失望和内疚的情绪。',
          '建立积极心态（习语使用）。'
        ],
        preTaskReview: {
          words: ['disappointed', 'referee', 'mistake', 'decision', 'teamwork'],
          phrases: ['feel blue', 'long face', 'let everyone down', 'look on the bright side']
        },
        fixedOpening: "Hey, I saw you sitting here on the bench after the final whistle. **Why the long face? Are you feeling blue about the final score?**",
        phases: [
          { name: '1. Checking In', nameCn: '1. 确认状况', aiGoal: 'Notice their "long face" and ask why they feel blue.', userHint: 'Apologize for letting the team down.' },
          { name: '2. Reassurance', nameCn: '2. 宽慰', aiGoal: 'Tell them not to be too hard on themselves, it was an accident.', userHint: 'Argue that if you were careful, the team could have won.' },
          { name: '3. The Lesson', nameCn: '3. 汲取教训', aiGoal: 'Encourage looking on the bright side. Mistakes help you learn.', userHint: 'Agree, but admit it is hard to lose.' },
          { name: '4. Team Spirit', nameCn: '4. 团队精神', aiGoal: 'Remind them "you can\'t win them all" and emphasize pulling together as a team.', userHint: 'Smile and promise to work harder next time.' }
        ]
      }
    ]
  },
  {
    id: 'unit4',
    title: 'Unit 4: The Wonders of Nature',
    titleCn: '第四单元：大自然奇观',
    scenes: [
      {
        id: 'u4-s1',
        title: 'Scene 1: Geography Quiz Talk',
        titleCn: '场景一：地理竞答交流',
        context: 'You and a classmate (AI) are preparing for a geography game show. You quiz each other about world records using large numbers.',
        contextCn: '你和同学（AI）正在准备地理竞答秀。你们互相用庞大的数字考察世界之最。',
        targetAwareness: [
          'Compare natural features using comparatives/superlatives.',
          'Confidently state facts with large numbers (thousands, millions).'
        ],
        targetAwarenessCn: [
          '使用比较级/最高级比较自然景观。',
          '自信描述大型数字。'
        ],
        preTaskReview: {
          words: ['measurement', 'surface', 'depth', 'ocean', 'million'],
          phrases: ['square kilometres', 'below sea level', 'the longest river']
        },
        fixedOpening: "Let's practice for the geography quiz together here in the classroom! I'll test you first. **What is the highest mountain in the world?**",
        phases: [
          { name: '1. Starting the Quiz', nameCn: '1. 竞答开场', aiGoal: 'Propose to review geography facts and ask what the highest mountain in the world is.', userHint: 'Answer Mount Qomolangma and share its height (8,848.86m).' },
          { name: '2. Rivers & Deserts', nameCn: '2. 河流与沙漠', aiGoal: 'Confirm and ask what the largest desert in the world is.', userHint: 'Say the Sahara Desert and mention its size (9 million sq km).' },
          { name: '3. Deep Waters', nameCn: '3. 深水探索', aiGoal: 'Ask about the deepest point in the ocean.', userHint: 'Name the Mariana Trench and note its depth (about 11,000m).' },
          { name: '4. Roles Reversed', nameCn: '4. 角色互换', aiGoal: 'Praise their knowledge and challenge them to ask a question back.', userHint: 'Ask a comparative question (e.g., Which river is longer?).' }
        ]
      },
      {
        id: 'u4-s2',
        title: 'Scene 2: Interviewing a Deep-Sea Explorer',
        titleCn: '场景二：采访深海探险家',
        context: 'As a school reporter, you are interviewing a deep-sea researcher (AI) after their presentation about exploring the ocean depths.',
        contextCn: '作为校报记者，你在听完一位深海科研人员（AI）的讲座后对他进行采访。',
        targetAwareness: [
          'Ask questions about exploring the unknown environment.',
          'Discuss deep-sea life and pollution concerns.'
        ],
        targetAwarenessCn: [
          '询问关于探索未知环境的问题。',
          '讨论深海生物与污染问题。'
        ],
        preTaskReview: {
          words: ['researcher', 'vessel', 'depth', 'unusual', 'rubbish'],
          phrases: ['deep sea', 'dive deeper', 'create their own light']
        },
        fixedOpening: "Thank you for coming to talk to me after my presentation here in the lecture hall. **What would you like to know about our latest deep-sea exploration?**",
        phases: [
          { name: '1. Curiosity', nameCn: '1. 表达好奇', aiGoal: 'Greet the student reporter and ask what they want to know.', userHint: 'Ask why researchers are studying the deep sea.' },
          { name: '2. The Deep Environment', nameCn: '2. 深海环境', aiGoal: 'Explain it\'s driven by curiosity since it\'s mostly unknown. Describe the extreme environment.', userHint: 'Ask about the unusual animals living there.' },
          { name: '3. Strange Creatures', nameCn: '3. 奇异生物', aiGoal: 'Mention blind animals and animals that create their own light.', userHint: 'Express amazement and ask about surprising discoveries.' },
          { name: '4. Human Impact', nameCn: '4. 人类影响', aiGoal: 'Express concern about seeing rubbish even at 11,000 metres deep. Suggest everyone must protect the sea.', userHint: 'Agree strongly on environmental protection.' }
        ]
      },
      {
        id: 'u4-s3',
        title: 'Scene 3: Reaching the Top',
        titleCn: '场景三：登顶珠峰',
        context: 'You run a podcast. Today you are talking to a mountaineer (AI) who reached the top of Mount Qomolangma.',
        contextCn: '你是一个播客主播。今天你邀请了一位登顶珠峰的登山者（AI）做客畅谈。',
        targetAwareness: [
          'Discuss ambition, risks, and achievements.',
          'Use words like "survive", "determined", "conditions".'
        ],
        targetAwarenessCn: [
          '讨论抱负、风险和成就。',
          '使用如 survive, determined 等词汇。'
        ],
        preTaskReview: {
          words: ['climber', 'survive', 'condition', 'determined', 'achievement'],
          phrases: ['high cliffs', 'human curiosity', 'reach the top']
        },
        fixedOpening: "Welcome to the show! It's a pleasure to have a legendary mountaineer like you here in the podcast studio. **Have you always wondered why people risk everything to climb such dangerous mountains?**",
        phases: [
          { name: '1. Welcome', nameCn: '1. 欢迎开场', aiGoal: 'Greet the listeners and host, happy to share the mountain experience.', userHint: 'Welcome the guest and ask why it\'s so difficult to climb it.' },
          { name: '2. Extreme Conditions', nameCn: '2. 极端条件', aiGoal: 'Describe the terrible conditions: thin air, -30 degrees, changeable weather.', userHint: 'Ask why people risk their lives to do it.' },
          { name: '3. Human Spirit', nameCn: '3. 攀登精神', aiGoal: 'Quote "because it\'s there" and talk about human curiosity and ambition.', userHint: 'Ask about the teamwork required to reach the top.' },
          { name: '4. The Golden Advice', nameCn: '4. 给听众的建议', aiGoal: 'Emphasize that teamwork and a strong mind are essential for survival.', userHint: 'Thank the mountaineer for their inspiring story.' }
        ]
      }
    ]
  },
  {
    id: 'unit5',
    title: 'Unit 5: Nature\'s Temper',
    titleCn: '第五单元：大自然的脾气',
    scenes: [
      {
        id: 'u5-s1',
        title: 'Scene 1: Caught in a Typhoon',
        titleCn: '场景一：遭遇台风',
        context: 'A strong typhoon hit the city yesterday. You are back at school and chatting with a friend (AI) about your experiences during the storm.',
        contextCn: '昨天城市遭遇强台风。你回到学校，正和朋友（AI）聊起台风发生时的经历。',
        targetAwareness: [
          'Use the past continuous tense to describe ongoing actions in the past.',
          'Share personal experiences during bad weather.'
        ],
        targetAwarenessCn: [
          '使用过去进行时描述过去正在发生的动作。',
          '分享恶劣天气下的亲身经历。'
        ],
        preTaskReview: {
          words: ['typhoon', 'neighbourhood', 'roof', 'mess', 'trouble'],
          phrases: ['wind was blowing', 'raining hard', 'clean-up']
        },
        fixedOpening: "Hi! It's good to see you back at school after that terrible storm. I heard the typhoon was really severe in your neighborhood. **Is everything OK with you and your family?**",
        phases: [
          { name: '1. Checking the Aftermath', nameCn: '1. 灾后问候', aiGoal: 'Ask if the user and their family are okay after the typhoon.', userHint: 'State that you are fine but it was scary.' },
          { name: '2. The Moment It Hit', nameCn: '2. 台风来临时', aiGoal: 'Ask "What were you doing when the typhoon hit?"', userHint: 'Use the past continuous tense (e.g., I was having dinner when...).' },
          { name: '3. Sharing AI\'s Experience', nameCn: '3. 分享见闻', aiGoal: 'Share what you were doing. (e.g., "I was doing homework when the windows shook.")', userHint: 'Ask if there was any damage to their house.' },
          { name: '4. Recovery', nameCn: '4. 灾后恢复', aiGoal: 'Say the roof broke, but the neighbourhood is doing clean-up now.', userHint: 'Offer to help them clear the streets/yard.' }
        ]
      },
      {
        id: 'u5-s2',
        title: 'Scene 2: Preparing for the Worst',
        titleCn: '场景二：防患未然',
        context: 'A weather report warns of severe floods. You and a community worker (AI) are discussing how to prepare the neighbourhood.',
        contextCn: '天气预报警告将有严重洪涝。你和社区工作者（AI）正商量如何做防灾准备。',
        targetAwareness: [
          'Discuss emergency supplies and disaster preparation.',
          'Give advice on actions to take before an event hits.'
        ],
        targetAwarenessCn: [
          '讨论应急物资与防灾准备。',
          '就在灾害来临前应采取的行动提供建议。'
        ],
        preTaskReview: {
          words: ['floodwater', 'supply', 'preparation', 'warn', 'save'],
          phrases: ['move things off the floor', 'emergency supplies', 'stay inside']
        },
        fixedOpening: "Attention everyone here at the community center! We've just received a severe flood warning. **Do you have your emergency supplies ready at home?**",
        phases: [
          { name: '1. The Warning', nameCn: '1. 灾害预警', aiGoal: 'Warn the user about the incoming flood and ask if they are ready.', userHint: 'Say you heard the news but don\'t know what to prepare.' },
          { name: '2. Essential Supplies', nameCn: '2. 应急物资储备', aiGoal: 'Suggest storing food, water, and emergency supplies immediately.', userHint: 'Ask what else should be done inside the house.' },
          { name: '3. Securing the House', nameCn: '3. 加固房屋', aiGoal: 'Advise moving things off the floor and covering the windows.', userHint: 'Confirm the action and ask if it is safe to travel.' },
          { name: '4. Stay Put', nameCn: '4. 居家避险', aiGoal: 'Strongly advise to stay inside and wait for official updates.', userHint: 'Agree and thank the worker for the vital information.' }
        ]
      },
      {
        id: 'u5-s3',
        title: 'Scene 3: A Heroic Flash',
        titleCn: '场景三：英雄时刻',
        context: 'You read an article about how a schoolgirl named Tilly saved tourists from a tsunami. You discuss her quick thinking with your teacher (AI).',
        contextCn: '你读了一篇关于女孩Tilly如何在海啸中救人的文章。你正和老师（AI）讨论她的机智。',
        targetAwareness: [
          'Narrate key events sequentially (beginning, middle, end).',
          'Reflect on the value of safety knowledge.'
        ],
        targetAwarenessCn: [
          '按顺叙述关键事件（起承转合）。',
          '反思安全知识的价值。'
        ],
        preTaskReview: {
          words: ['tsunami', 'guard', 'panic', 'scream', 'knowledge'],
          phrases: ['quick thinking', 'life and death', 'warn people']
        },
        fixedOpening: "Today in our English class, we're discussing the amazing story of Tilly Smith, the girl who saved many lives during a tsunami. **What do you think was her most important action?**",
        phases: [
          { name: '1. Story Introduction', nameCn: '1. 故事引入', aiGoal: 'Ask what the student thought of Tilly Smith\'s story.', userHint: 'Express admiration for her quick thinking.' },
          { name: '2. Spotting the Signs', nameCn: '2. 察觉征兆', aiGoal: 'Ask "How did she realize the tsunami was coming?"', userHint: 'Explain she remembered geography class and saw water moving away.' },
          { name: '3. Taking Action', nameCn: '3. 果断行动', aiGoal: 'Highlight that she warned her parents and the security guard rushed to get people off the beach.', userHint: 'Comment on how dangerous it was and how panic was avoided.' },
          { name: '4. The Takeaway', nameCn: '4. 深刻启示', aiGoal: 'Conclude that school knowledge can save lives in critical moments.', userHint: 'Agree that learning safety survival skills is important.' }
        ]
      }
    ]
  },
  {
    id: 'unit6',
    title: 'Unit 6: Crossing Cultures',
    titleCn: '第六单元：跨文化交际',
    scenes: [
      {
        id: 'u6-s1',
        title: 'Scene 1: An Embarrassing Greeting',
        titleCn: '场景一：尴尬的问候',
        context: 'You just arrived in the UK as an exchange student. You tried to bow to your host family, which confused them. Talk to your host brother/sister (AI) about greetings.',
        contextCn: '你作为交换生刚到英国。你试图向寄宿家庭鞠躬，让他们很困惑。和你的寄宿兄弟/姐妹（AI）谈谈打招呼的习惯。',
        targetAwareness: [
          'Compare body language across cultures (bowing vs shaking hands).',
          'Use "so...that", "unless", or "as soon as".'
        ],
        targetAwarenessCn: [
          '比较跨文化的肢体语言（鞠躬与握手）。',
          '熟练使用连词。'
        ],
        preTaskReview: {
          words: ['bow', 'embarrassed', 'confused', 'formal', 'cheek'],
          phrases: ['shake hands', 'so formal that', 'as soon as']
        },
        fixedOpening: "Welcome to London! We're so happy to have you in our home. Oh... why did you just bow? We usually just shake hands here in the UK! **Were you confused by the way we greet each other?**",
        phases: [
          { name: '1. The Mix-up', nameCn: '1. 误会的产生', aiGoal: 'Laugh kindly and say the bow was surprising as soon as you met.', userHint: 'Apologize and explain you bow in your culture.' },
          { name: '2. Local Customs', nameCn: '2. 本地习俗', aiGoal: 'Explain that in the UK, people usually just say "hello" or shake hands. Bowing is so formal that they rarely do it.', userHint: 'Ask if people kiss on the cheek in the UK.' },
          { name: '3. Further Differences', nameCn: '3. 更多差异', aiGoal: 'Say they hug sometimes, but don\'t kiss unless they love the person.', userHint: 'Express surprise at the cultural difference.' },
          { name: '4. Feeling Comfortable', nameCn: '4. 融入环境', aiGoal: 'Tell them not to feel embarrassed; it\'s normal to experience culture shock.', userHint: 'Thank them for helping you learn the customs.' }
        ]
      },
      {
        id: 'u6-s2',
        title: 'Scene 2: Table Manners Tutorial',
        titleCn: '场景二：餐桌礼仪小课堂',
        context: 'You have been invited to a Chinese dinner party. You ask your Chinese friend (AI) about proper table manners to avoid making mistakes.',
        contextCn: '你受邀参加一个中国晚宴。你向中国朋友（AI）请教餐桌礼仪以避免犯错。',
        targetAwareness: [
          'Ask for and give advice on cultural behaviors.',
          'Discuss rules using words like "improper", "polite".'
        ],
        targetAwarenessCn: [
          '就文化行为征求/提供建议。',
          '讨论礼仪规范。'
        ],
        preTaskReview: {
          words: ['chopstick', 'polite', 'manner', 'rude', 'proper'],
          phrases: ['serving chopsticks', 'point at', 'avoid doing']
        },
        fixedOpening: "I'm so excited for our big Chinese dinner tomorrow! I noticed you seem a bit worried about it, though. **Are you nervous about using chopsticks or other Chinese table manners?**",
        phases: [
          { name: '1. The Request', nameCn: '1. 寻求帮助', aiGoal: 'Ask what they are worried about regarding the dinner tomorrow.', userHint: 'Say you don\'t know how to use chopsticks properly.' },
          { name: '2. Chopstick Rules', nameCn: '2. 筷子禁忌', aiGoal: 'Explain two rules: don\'t stick chopsticks into food, and don\'t point them at others.', userHint: 'Acknowledge the rules and ask about the food.' },
          { name: '3. Serving Food', nameCn: '3. 分餐礼仪', aiGoal: 'Mention they should use serving chopsticks for shared dishes to be polite.', userHint: 'Ask when it is polite to start eating.' },
          { name: '4. Showing Respect', nameCn: '4. 展现尊重', aiGoal: 'Advise waiting for older people to start eating first. Wish them a good meal!', userHint: 'Thank them for the crucial advice.' }
        ]
      },
      {
        id: 'u6-s3',
        title: 'Scene 3: A French Party Dilemma',
        titleCn: '场景三：法式派对困境',
        context: 'You are going to attend a party in France. You email a friend living in Paris (AI), but they respond with a video call to give you tips.',
        contextCn: '你要在法国参加派对。你发邮件求助在巴黎的朋友（AI），ta打来视频电话给你支招。',
        targetAwareness: [
          'Discuss time punctuality, gifts, and conversation topics.',
          'Identify what is acceptable vs. private in a foreign context.'
        ],
        targetAwarenessCn: [
          '探讨时间观念、礼物及话题选择。',
          '分辨异国语境下的可接受与私密界限。'
        ],
        preTaskReview: {
          words: ['private', 'blouse', 'custom', 'shock', 'topic'],
          phrases: ['on time', 'make friends', 'personal questions']
        },
        fixedOpening: "Salut! I got your email about the party in Paris, so I thought I'd give you a video call. Don't worry, French parties are fun! **What's your main concern about attending a French gathering?**",
        phases: [
          { name: '1. Arrival Time', nameCn: '1. 派对准时原则', aiGoal: 'Bring up the topic of arrival time. Advise not to arrive early.', userHint: 'Ask if being on time or a little late is better.' },
          { name: '2. The Host Gift', nameCn: '2. 伴手礼礼仪', aiGoal: 'Say arriving 10 minutes late is polite. Also, remind them to bring a gift.', userHint: 'Suggest bringing chocolates or flowers.' },
          { name: '3. Safe Topics', nameCn: '3. 安全话题探讨', aiGoal: 'Agree on the gifts. Warn against asking personal questions like age or money because French people are private.', userHint: 'Ask what a safe conversation topic is.' },
          { name: '4. Language Effort', nameCn: '4. 语言破冰力量', aiGoal: 'Recommend topics like food or culture. Remind them that saying a simple "Merci" goes a long way.', userHint: 'Promise to practice some basic French words.' }
        ]
      }
    ]
  },
  {
    id: 'unit7',
    title: 'Unit 7: A Good Read',
    titleCn: '第七单元：好书推荐',
    scenes: [
      {
        id: 'u7-s1',
        title: 'Scene 1: Picking a Novel',
        titleCn: '场景一：挑选小说',
        context: 'You are at the school library looking for a book for your report. The librarian (AI) helps you explore different genres.',
        contextCn: '你在学校图书馆找书写读后感。图书管理员（AI）帮你探索不同的书籍类型。',
        targetAwareness: [
          'Talk about book genres (fantasy, science fiction, classic).',
          'Use the present perfect tense (Have you ever read...?).'
        ],
        targetAwarenessCn: [
          '谈论书籍类型。',
          '使用现在完成时探讨阅读经历。'
        ],
        preTaskReview: {
          words: ['fantasy', 'mystery', 'detective', 'fiction', 'recently'],
          phrases: ['science fiction', 'have you ever', 'heard of']
        },
        fixedOpening: "Hello! I see you're looking at the novel section here at the library counter. **Have you decided on a book for your report yet?**",
        phases: [
          { name: '1. Exploring Genres', nameCn: '1. 探索流派', aiGoal: 'Ask if they have decided on a book and what type they like.', userHint: 'Say you like science fiction or mystery novels.' },
          { name: '2. Famous Titles', nameCn: '2. 名著推荐', aiGoal: 'Recommend "The Three-Body Problem" or a detective story. Ask "Have you ever read it?"', userHint: 'Answer using the present perfect (e.g., No, I haven\'t read it yet).' },
          { name: '3. A Quick Hook', nameCn: '3. 故事诱饵', aiGoal: 'Briefly give the premise (e.g., "It\'s about aliens..."). Ask if it sounds interesting.', userHint: 'Express enthusiasm and ask for more details.' },
          { name: '4. Making the Choice', nameCn: '4. 最终决定', aiGoal: 'Suggest finding the book on the shelf so they can start reading.', userHint: 'Thank the librarian and say you will borrow it.' }
        ]
      },
      {
        id: 'u7-s2',
        title: 'Scene 2: Into Wonderland',
        titleCn: '场景二：坠入仙境',
        context: 'You just finished "Alice\'s Adventures in Wonderland". You are excitedly discussing the magic and plot with your friend (AI).',
        contextCn: '你刚看完《爱丽丝梦游仙境》。你正兴奋地和朋友（AI）讨论其中的魔法情节。',
        targetAwareness: [
          'Discuss specific events and characters in a fantasy plot.',
          'Retell segments of a story accurately.'
        ],
        targetAwarenessCn: [
          '讨论奇幻情节中的具体事件与角色。',
          '准确复述故事片段。'
        ],
        preTaskReview: {
          words: ['magic', 'realize', 'forget', 'grow', 'wonderland'],
          phrases: ['find a door', 'drink from a bottle', 'reach it']
        },
        fixedOpening: "Hey! I'm so glad we met here in the park. I heard you just finished reading Alice's Adventures in Wonderland. **What happened when Alice found that tiny door?**",
        phases: [
          { name: '1. The Setup', nameCn: '1. 奇幻开局', aiGoal: 'Ask what happens when Alice finds the tiny door.', userHint: 'Explain she drinks from a bottle and grows smaller.' },
          { name: '2. A Problem Arises', nameCn: '2. 突发危机', aiGoal: 'Point out she left the key on the table. Ask what she does next.', userHint: 'Say she eats a magic cake and grows bigger.' },
          { name: '3. Favourite Part', nameCn: '3. 最爱桥段', aiGoal: 'Ask "What is your favorite part of the book?"', userHint: 'Share a funny or interesting moment from the story.' },
          { name: '4. Final Thoughts', nameCn: '4. 核心感想', aiGoal: 'Summarize that the story is really about growing up. Ask if they agree.', userHint: 'Agree that fantasy books can teach real lessons.' }
        ]
      },
      {
        id: 'u7-s3',
        title: 'Scene 3: The Secret Garden Insights',
        titleCn: '场景三：《秘密花园》的启示',
        context: 'In an English literature class, your teacher (AI) asks you to share your book report and the lessons learned from "The Secret Garden".',
        contextCn: '英国文学课上，老师（AI）让你分享《秘密花园》的读书报告和感悟。',
        targetAwareness: [
          'Break down a plot (beginning, climax, ending).',
          'Extract moral lessons from classic literature.'
        ],
        targetAwarenessCn: [
          '拆解故事情节（起因、高潮、结局）。',
          '从经典文学中提取道德寓意。'
        ],
        preTaskReview: {
          words: ['secret', 'weak', 'painful', 'alive', 'spoiled'],
          phrases: ['book report', 'grow stronger', 'return home']
        },
        fixedOpening: "It's your turn to present your book report in front of the class! **Could you please introduce the main characters of The Secret Garden for us?**",
        phases: [
          { name: '1. The Introduction', nameCn: '1. 背景介绍', aiGoal: 'Ask for a brief introduction of the main character, Mary.', userHint: 'Describe Mary as spoiled but lonely at first.' },
          { name: '2. The Turning Point', nameCn: '2. 剧情转折', aiGoal: 'Ask what happens when she finds the hidden garden.', userHint: 'Explain she makes friends and starts taking care of plants.' },
          { name: '3. Character Growth', nameCn: '3. 角色成长', aiGoal: 'Ask how it affects her cousin Colin.', userHint: 'Describe how Colin grows stronger and walks again.' },
          { name: '4. The Moral', nameCn: '4. 提炼寓意', aiGoal: 'Ask what the most important lesson from the book is for the class.', userHint: 'State that caring for nature and friends heals the soul.' }
        ]
      }
    ]
  },
  {
    id: 'unit8',
    title: 'Unit 8: Making a Difference',
    titleCn: '第八单元：让世界更美好',
    scenes: [
      {
        id: 'u8-s1',
        title: 'Scene 1: The Animal Shelter',
        titleCn: '场景一：动物收容所',
        context: 'You want to become a volunteer. You visit a local animal shelter and ask a senior volunteer (AI) about their duties and experiences.',
        contextCn: '你想当志愿者。你来到当地的动物收容所，向资深志愿者（AI）询问他们的职责和经历。',
        targetAwareness: [
          'Discuss volunteer duties (feeding, cleaning).',
          'Use the present perfect with "for" and "since".'
        ],
        targetAwarenessCn: [
          '讨论志愿者的职责（喂食、清理）。',
          '熟练运用现在完成时与时间介词。'
        ],
        preTaskReview: {
          words: ['shelter', 'cage', 'condition', 'donation', 'adopt'],
          phrases: ['clean up', 'look after', 'since last year']
        },
        fixedOpening: "Hello there! Welcome to the animal shelter. Are you here to help our animals? **Have you ever volunteered at a shelter before?**",
        phases: [
          { name: '1. Volunteer History', nameCn: '1. 志愿经历', aiGoal: 'Welcome them and ask if they have volunteered before.', userHint: 'Say no, but ask how long they have worked there.' },
          { name: '2. Daily Tasks', nameCn: '2. 日常工作', aiGoal: 'Say you have volunteered since last year. Ask what kind of tasks they expect to do.', userHint: 'Mention cleaning cages or walking dogs.' },
          { name: '3. Meaning of Work', nameCn: '3. 工作的意义', aiGoal: 'Explain some animals are in poor condition and need love. Ask why they want to join.', userHint: 'Express love for animals and a desire to help.' },
          { name: '4. Signing Up', nameCn: '4. 报名入队', aiGoal: 'Offer to show them around and sign them up for a once a week shift.', userHint: 'Accept happily and express readiness to start.' }
        ]
      },
      {
        id: 'u8-s2',
        title: 'Scene 2: Visiting the Elderly',
        titleCn: '场景二：探望老人',
        context: 'You belong to a youth group. You are coordinating with the group leader (AI) on what activities you can plan for the nursing home visit next week.',
        contextCn: '你是青年社团的一员。你正和社团负责人（AI）协调下周去敬老院可以安排什么活动。',
        targetAwareness: [
          'Brainstorm supportive social activities.',
          'Reflect on loneliness, empathy, and providing aid.'
        ],
        targetAwarenessCn: [
          '头脑风暴陪伴性质的社会活动。',
          '反思孤独感、共情与提供帮助。'
        ],
        preTaskReview: {
          words: ['elderly', 'lonely', 'exercise', 'experience', 'patience'],
          phrases: ['meaningful', 'teach how to', 'care for']
        },
        fixedOpening: "Hi Team! Thanks for coming to our youth group meeting. We're visiting the nursing home next week. **What activities do you think would most brighten their day?**",
        phases: [
          { name: '1. Identifying Needs', nameCn: '1. 洞察需求', aiGoal: 'Note that many elderly are lonely. Ask what activities might brighten their day.', userHint: 'Suggest exercising or playing Chinese chess together.' },
          { name: '2. Modern Help', nameCn: '2. 数字化反哺', aiGoal: 'Agree, and suggest teaching them to use mobile phones. Ask if they are patient enough.', userHint: 'Say yes, technology helps them stay connected with relatives.' },
          { name: '3. Two-Way Learning', nameCn: '3. 双向学习', aiGoal: 'Remind them that elderly people have many interesting life stories to share.', userHint: 'Agree that chatting with them teaches valuable life lessons.' },
          { name: '4. Group Commitment', nameCn: '4. 社团承诺', aiGoal: 'Conclude that it\'s important to care for the elderly. Finalize the plan for next week.', userHint: 'Commit to the plan and look forward to the visit.' }
        ]
      },
      {
        id: 'u8-s3',
        title: 'Scene 3: A Hero\'s Call',
        titleCn: '场景三：英雄的召唤',
        context: 'You just listened to a speech by a Blue Sky Rescue member (AI). You talk to them backstage, feeling inspired to join an emergency rescue squad.',
        contextCn: '你刚听完蓝天救援队成员（AI）的演讲。你在后台与ta交谈，深受鼓舞也想加入应急救援队。',
        targetAwareness: [
          'Discuss teamwork, life-saving skills, and selflessness.',
          'Understand the challenging nature of true voluntary work.'
        ],
        targetAwarenessCn: [
          '讨论团队合作、抢险技能与无私奉献。',
          '理解真正志愿工作包含的艰巨挑战。'
        ],
        preTaskReview: {
          words: ['rescue', 'teamwork', 'voluntary', 'danger', 'effort'],
          phrases: ['make a difference', 'life-saving', 'value of life']
        },
        fixedOpening: "Hello! I noticed you listening very intently backstage after my speech. **Did my stories about the rescue squad inspire you to join our mission?**",
        phases: [
          { name: '1. Inspiration', nameCn: '1. 受到鼓舞', aiGoal: 'Ask how the student felt about the speech and the rescue stories.', userHint: 'Express extreme admiration for their life-saving work.' },
          { name: '2. The Harsh Reality', nameCn: '2. 严酷现实', aiGoal: 'Warn that the work is voluntary, unpaid, and often means going without sleep or food.', userHint: 'Say you understand it is hard but worth the effort.' },
          { name: '3. Core Skills', nameCn: '3. 核心能力', aiGoal: 'Ask what they think is the most important skill for a successful rescue.', userHint: 'Identify teamwork as the key to success.' },
          { name: '4. Call to Action', nameCn: '4. 行动号召', aiGoal: 'Encourage them to learn basic first aid now, and join when they are older. "Together we can make a difference."', userHint: 'Promise to study hard and help people in need.' }
        ]
      }
    ]
  }
];
