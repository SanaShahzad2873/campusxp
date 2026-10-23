import { EXTRA_ROWS } from "./extra";
export type Lang = "en" | "ur" | "mixed";
export type Difficulty = 1 | 2 | 3;
export interface Topic { id: string; name: string; urdu: string; desc: string; objectives: string[] }
export interface Subject { id: string; name: string; code: string; sem: string; desc: string; color: string; topics: Topic[] }
export interface Question { id: string; subjectId: string; topicId: string; type: "mcq" | "output" | "bug" | "arrange" | "pseudo"; prompt: string; code?: string; blocks?: string[]; options: string[]; correct: number; explanation: string; explanationUr: string; difficulty: Difficulty; source: string; verified: boolean }

export const SUBJECTS: Subject[] = [
  { id: "pf", name: "Programming Fundamentals", code: "CS-101", sem: "Semester 1–2", desc: "Variables, decisions, loops and functions — the foundation of every BS CS degree in Pakistan.", color: "#7C3AED", topics: [
    { id: "pf-var", name: "Variables & Data Types", urdu: "متغیرات اور ڈیٹا ٹائپس", desc: "Declaring, naming and typing data", objectives: ["Choose correct data types", "Trace variable values", "Avoid naming mistakes"] },
    { id: "pf-cond", name: "Conditions & Logic", urdu: "شرائط اور منطق", desc: "if/else, switch and boolean logic", objectives: ["Evaluate conditions", "Use logical operators", "Predict branch output"] },
    { id: "pf-loop", name: "Loops", urdu: "لوپس", desc: "for, while and nested loops", objectives: ["Trace loop iterations", "Avoid infinite loops", "Count executions"] },
    { id: "pf-func", name: "Functions", urdu: "فنکشنز", desc: "Parameters, return values and scope", objectives: ["Call functions correctly", "Understand scope", "Use return values"] },
  ]},
  { id: "oop", name: "Object-Oriented Programming", code: "CS-102", sem: "Semester 2–3", desc: "Classes, inheritance and polymorphism — how real software is structured.", color: "#06B6D4", topics: [
    { id: "oop-class", name: "Classes & Objects", urdu: "کلاسز اور آبجیکٹس", desc: "Blueprints vs instances", objectives: ["Define classes", "Create objects", "Use constructors"] },
    { id: "oop-encap", name: "Encapsulation", urdu: "انکیپسولیشن", desc: "Access modifiers and getters/setters", objectives: ["Protect data", "Use private/public correctly"] },
    { id: "oop-inh", name: "Inheritance", urdu: "وراثت", desc: "Base and derived classes", objectives: ["Reuse code via inheritance", "Override methods"] },
    { id: "oop-poly", name: "Polymorphism", urdu: "پولی مورفزم", desc: "Overloading and overriding", objectives: ["Distinguish overload vs override", "Predict dynamic dispatch"] },
  ]},
  { id: "dsa", name: "Data Structures & Algorithms", code: "CS-201", sem: "Semester 3–4", desc: "Arrays, stacks, trees, graphs and Big-O — the heart of interviews.", color: "#22C55E", topics: [
    { id: "dsa-arr", name: "Arrays & Complexity", urdu: "ایرے اور پیچیدگی", desc: "Indexing and Big-O basics", objectives: ["Compute time complexity", "Use array indexing"] },
    { id: "dsa-stack", name: "Stacks & Queues", urdu: "اسٹیک اور کیو", desc: "LIFO and FIFO structures", objectives: ["Trace push/pop", "Trace enqueue/dequeue"] },
    { id: "dsa-tree", name: "Trees & Recursion", urdu: "درخت اور ریکرژن", desc: "Binary trees and recursive thinking", objectives: ["Traverse trees", "Trace recursion"] },
    { id: "dsa-sort", name: "Sorting & Searching", urdu: "چھانٹی اور تلاش", desc: "Bubble, binary search and more", objectives: ["Compare sort complexities", "Apply binary search"] },
  ]},
  { id: "db", name: "Database Management Systems", code: "CS-202", sem: "Semester 4–5", desc: "SQL, keys, normalization and transactions used in every Pakistani software house.", color: "#F59E0B", topics: [
    { id: "db-sql", name: "SQL Basics", urdu: "SQL کی بنیادیں", desc: "SELECT, WHERE, ORDER BY", objectives: ["Write queries", "Filter results"] },
    { id: "db-keys", name: "Keys & Relationships", urdu: "کیز اور تعلقات", desc: "Primary, foreign and candidate keys", objectives: ["Identify keys", "Model relationships"] },
    { id: "db-norm", name: "Normalization", urdu: "نارملائزیشن", desc: "1NF, 2NF, 3NF and redundancy", objectives: ["Apply normal forms", "Remove redundancy"] },
    { id: "db-join", name: "Joins & Transactions", urdu: "جوائنز اور ٹرانزیکشنز", desc: "INNER/LEFT joins and ACID", objectives: ["Combine tables", "Explain ACID"] },
  ]},
  { id: "os", name: "Operating Systems", code: "CS-301", sem: "Semester 5–6", desc: "Processes, scheduling, memory and deadlocks.", color: "#EC4899", topics: [
    { id: "os-proc", name: "Processes & Threads", urdu: "پروسیس اور تھریڈز", desc: "Programs in execution", objectives: ["Differentiate process/thread", "Explain states"] },
    { id: "os-sched", name: "CPU Scheduling", urdu: "CPU شیڈولنگ", desc: "FCFS, SJF, Round Robin", objectives: ["Compare algorithms", "Compute waiting time"] },
    { id: "os-mem", name: "Memory Management", urdu: "میموری مینجمنٹ", desc: "Paging, segmentation, virtual memory", objectives: ["Explain paging", "Avoid fragmentation issues"] },
    { id: "os-dead", name: "Deadlocks", urdu: "ڈیڈ لاک", desc: "Conditions, prevention and avoidance", objectives: ["Identify Coffman conditions", "Prevent deadlock"] },
  ]},
  { id: "cn", name: "Computer Networks", code: "CS-302", sem: "Semester 5–6", desc: "OSI, TCP/IP, addressing and the protocols behind the internet.", color: "#38BDF8", topics: [
    { id: "cn-osi", name: "OSI & TCP/IP Models", urdu: "OSI اور TCP/IP ماڈل", desc: "Layers and their jobs", objectives: ["Map protocols to layers", "Explain encapsulation"] },
    { id: "cn-ip", name: "IP Addressing", urdu: "IP ایڈریسنگ", desc: "IPv4, subnetting basics", objectives: ["Read IP addresses", "Understand subnets"] },
    { id: "cn-tcp", name: "TCP vs UDP", urdu: "TCP بمقابلہ UDP", desc: "Reliable vs fast transport", objectives: ["Choose protocol", "Explain handshake"] },
    { id: "cn-app", name: "Application Protocols", urdu: "ایپلیکیشن پروٹوکولز", desc: "HTTP, DNS, DHCP, FTP", objectives: ["Match protocol to purpose", "Explain DNS lookup"] },
  ]},
  { id: "se", name: "Software Engineering", code: "CS-303", sem: "Semester 5–7", desc: "SDLC, testing, Git and design principles for professional teams.", color: "#A78BFA", topics: [
    { id: "se-sdlc", name: "SDLC & Models", urdu: "SDLC اور ماڈلز", desc: "Waterfall, Agile, Scrum", objectives: ["Compare models", "Explain sprints"] },
    { id: "se-test", name: "Testing", urdu: "ٹیسٹنگ", desc: "Unit, integration, black/white box", objectives: ["Choose test type", "Write test thinking"] },
    { id: "se-git", name: "Version Control", urdu: "ورژن کنٹرول", desc: "Git, branches and merges", objectives: ["Use Git workflow", "Resolve conflicts conceptually"] },
    { id: "se-design", name: "Design Principles", urdu: "ڈیزائن اصول", desc: "SOLID, coupling, cohesion", objectives: ["Apply SOLID", "Reduce coupling"] },
  ]},
  { id: "dm", name: "Discrete Mathematics", code: "MTH-201", sem: "Semester 2–3", desc: "Logic, sets, relations and combinatorics — math behind computing.", color: "#F97316", topics: [
    { id: "dm-logic", name: "Propositional Logic", urdu: "منطق", desc: "AND, OR, NOT, implication", objectives: ["Evaluate truth tables", "Use implications"] },
    { id: "dm-sets", name: "Sets & Relations", urdu: "سیٹس اور تعلقات", desc: "Union, intersection, equivalence", objectives: ["Perform set operations", "Check relation properties"] },
    { id: "dm-func", name: "Functions", urdu: "فنکشنز (ریاضی)", desc: "Injective, surjective, bijective", objectives: ["Classify functions", "Compose functions"] },
    { id: "dm-comb", name: "Combinatorics", urdu: "امتزاجیات", desc: "Permutations and combinations", objectives: ["Count arrangements", "Apply pigeonhole principle"] },
  ]},
  { id: "ai", name: "Artificial Intelligence Fundamentals", code: "CS-401", sem: "Semester 6–8", desc: "Search, knowledge representation and machine learning basics.", color: "#34D399", topics: [
    { id: "ai-search", name: "Search Algorithms", urdu: "تلاش کے الگورتھم", desc: "BFS, DFS, A* and heuristics", objectives: ["Compare BFS/DFS", "Explain A*"] },
    { id: "ai-kr", name: "Knowledge Representation", urdu: "علم کی نمائندگی", desc: "Rules, logic and agents", objectives: ["Model knowledge", "Describe agents"] },
    { id: "ai-ml", name: "Machine Learning Basics", urdu: "مشین لرننگ کی بنیادیں", desc: "Supervised, unsupervised, overfitting", objectives: ["Classify ML types", "Avoid overfitting"] },
  ]},
  { id: "coa", name: "Computer Organization & Architecture", code: "CS-203", sem: "Semester 3–4", desc: "Binary, CPU, memory hierarchy and instruction cycles.", color: "#FB7185", topics: [
    { id: "coa-bin", name: "Binary & Number Systems", urdu: "بائنری اور نمبر سسٹم", desc: "Binary, hex and conversions", objectives: ["Convert bases", "Represent negatives"] },
    { id: "coa-cpu", name: "CPU & Instruction Cycle", urdu: "CPU اور انسٹرکشن سائیکل", desc: "Fetch-decode-execute, registers", objectives: ["Trace instruction cycle", "Identify CPU parts"] },
    { id: "coa-mem", name: "Memory Hierarchy & Cache", urdu: "میموری درجہ بندی اور کیشے", desc: "RAM, cache, locality", objectives: ["Order memory by speed", "Explain cache hits"] },
  ]},
];

// tuple: [subject, topic, diff, prompt, code?, options, correctIdx, en, ur]
type Row = [string, string, Difficulty, string, string | undefined, string[], number, string, string];
const R: Row[] = [
  // PF
  ["pf","pf-var",1,"Which data type is best for storing a student's CGPA like 3.75?",undefined,["int","float / double","char","bool"],1,"CGPA has a fractional part, so a floating-point type (float/double) is correct. int would drop .75.","CGPA میں اعشاریہ ہوتا ہے اس لیے float/double درست ہے، int سے .75 ختم ہو جائے گا۔"],
  ["pf","pf-var",1,"What is the value of x after: int x = 7 / 2; (in C/C++/Java)?","int x = 7 / 2;",["3.5","3","4","Error"],1,"Integer division discards the fraction: 7/2 = 3 in integer arithmetic.","Integer division میں کسر ختم ہو جاتی ہے: 7/2 = 3۔"],
  ["pf","pf-cond",1,"What does this print if marks = 45?","if (marks >= 50) print(\"Pass\"); else print(\"Fail\");",["Pass","Fail","Nothing","Error"],1,"45 is less than 50, so the else branch runs.","45، 50 سے کم ہے اس لیے else والا حصہ چلے گا۔"],
  ["pf","pf-cond",2,"Which operator means 'not equal to' in most C-family languages?",undefined,["=","==","!=","<>"],2,"!= compares for inequality. = assigns, == checks equality.","!= عدم مساوات کے لیے ہے۔ = assignment اور == مساوات جانچتا ہے۔"],
  ["pf","pf-loop",2,"How many times does 'Salam' print?","for (int i = 1; i <= 4; i++) print(\"Salam\");",["3","4","5","Infinite"],1,"i runs 1,2,3,4 — exactly 4 iterations.","i کی قدریں 1 تا 4 ہیں، یعنی 4 مرتبہ۔"],
  ["pf","pf-loop",2,"Which loop checks its condition AFTER running the body at least once?",undefined,["for loop","while loop","do-while loop","foreach loop"],2,"do-while executes the body first, then tests the condition.","do-while پہلے باڈی چلاتا ہے، پھر condition چیک کرتا ہے۔"],
  ["pf","pf-func",2,"What is returned by add(3, 4)?","int add(int a, int b) { return a + b; }",["34","7","0","void"],1,"The function returns a+b = 3+4 = 7.","Function a+b واپس کرتا ہے: 3+4 = 7۔"],
  ["pf","pf-func",3,"A variable declared inside a function is called…",undefined,["Global variable","Static variable","Local variable","Constant"],2,"Its scope is limited to that function — a local variable.","Function کے اندر declare ہونے والا variable local ہوتا ہے، scope محدود ہوتا ہے۔"],
  // OOP
  ["oop","oop-class",1,"In OOP, a class is best described as…",undefined,["A single value","A blueprint for creating objects","A loop","A database table"],1,"A class is a template/blueprint; objects are its instances.","Class ایک blueprint ہے؛ objects اس کی مثالیں (instances) ہیں۔"],
  ["oop","oop-class",2,"Which member runs automatically when an object is created?",undefined,["Destructor","Constructor","Getter","Static method"],1,"The constructor initializes a new object at creation time.","Object بنتے ہی constructor خودکار چلتا ہے۔"],
  ["oop","oop-encap",2,"Making fields private and providing public getters/setters is called…",undefined,["Inheritance","Encapsulation","Polymorphism","Abstraction only"],1,"Encapsulation bundles data with controlled access.","Data کو private رکھ کر controlled access دینا encapsulation ہے۔"],
  ["oop","oop-encap",1,"Which access modifier makes a member visible only inside its own class?",undefined,["public","protected","private","internal"],2,"private restricts access to the declaring class only.","private ممبر صرف اپنی class کے اندر قابلِ رسائی ہوتا ہے۔"],
  ["oop","oop-inh",2,"If Car inherits from Vehicle, then Car is the…",undefined,["Base class","Derived / child class","Interface","Object"],1,"Car extends Vehicle, so Car is the derived (child) class.","Car، Vehicle سے inherit کرتی ہے اس لیے derived/child class ہے۔"],
  ["oop","oop-inh",3,"Which OOP feature mainly promotes code reuse?",undefined,["Encapsulation","Inheritance","Data hiding","Compilation"],1,"Inheritance lets child classes reuse parent behaviour.","Inheritance سے child class والد class کا code دوبارہ استعمال کرتی ہے۔"],
  ["oop","oop-poly",3,"Method overloading is decided at…",undefined,["Run time","Compile time","Link time only","Never"],1,"Overload resolution uses parameter lists known at compile time.","Overloading کا فیصلہ compile time پر parameters دیکھ کر ہوتا ہے۔"],
  ["oop","oop-poly",3,"Method overriding requires…",undefined,["Different method names","Same signature in child class","Static methods only","Private base method"],1,"The child redefines a method with the same signature.","Overriding میں child class اسی signature کے method کو دوبارہ define کرتی ہے۔"],
  // DSA
  ["dsa","dsa-arr",2,"What is the time complexity of accessing an array element by index?",undefined,["O(n)","O(log n)","O(1)","O(n²)"],2,"Index access is direct address calculation — constant time.","Index سے access براہِ راست ہوتا ہے — O(1) constant time۔"],
  ["dsa","dsa-arr",3,"Binary search on a sorted array of 1024 elements takes at most about…",undefined,["1024 steps","512 steps","10 steps","32 steps"],2,"Each step halves the range: log2(1024) = 10.","ہر قدم میں range آدھا ہوتا ہے: log2(1024) = 10۔"],
  ["dsa","dsa-stack",1,"A stack follows which order?",undefined,["FIFO","LIFO","Random","Priority only"],1,"Last In, First Out — like a stack of plates.","Stack میں LIFO ہوتا ہے — آخری آیا، پہلے گیا۔"],
  ["dsa","dsa-stack",2,"Push 5, push 9, pop(), push 2. What is on top now?","Stack: push(5), push(9), pop(), push(2)",["5","9","2","Empty"],2,"pop removes 9, then 2 is pushed on top.","pop سے 9 نکلا، پھر 2 اوپر آیا — top = 2۔"],
  ["dsa","dsa-tree",2,"A binary tree node can have at most…",undefined,["1 child","2 children","3 children","Unlimited children"],1,"By definition each node has at most left and right child.","Binary tree میں ہر node کے زیادہ سے زیادہ 2 children ہوتے ہیں۔"],
  ["dsa","dsa-tree",3,"What does this recursion return for n = 3?","f(n): if n==0 return 0; else return n + f(n-1)",["3","6","0","Infinite loop"],1,"f(3)=3+f(2)=3+2+f(1)=3+2+1+0=6.","f(3)=3+2+1+0 = 6۔"],
  ["dsa","dsa-sort",2,"Which sorting algorithm repeatedly swaps adjacent elements if they are in wrong order?",undefined,["Merge sort","Bubble sort","Binary search","Quick sort partition only"],1,"Bubble sort compares and swaps neighbouring pairs.","Bubble sort پڑوسی elements کو compare کر کے swap کرتا ہے۔"],
  ["dsa","dsa-sort",3,"Worst-case time complexity of bubble sort is…",undefined,["O(n)","O(n log n)","O(n²)","O(1)"],2,"Two nested passes give n×n comparisons in the worst case.","Nested loops کی وجہ سے worst case O(n²) ہے۔"],
  // DB
  ["db","db-sql",1,"Which SQL keyword retrieves data from a table?",undefined,["GET","SELECT","FETCH ALL","OPEN"],1,"SELECT is the standard data-retrieval statement.","Data نکالنے کے لیے SELECT استعمال ہوتا ہے۔"],
  ["db","db-sql",2,"Which clause filters rows in SQL?",undefined,["ORDER BY","GROUP BY","WHERE","HAVING only"],2,"WHERE filters individual rows before grouping.","WHERE انفرادی rows کو filter کرتا ہے۔"],
  ["db","db-keys",1,"A primary key must be…",undefined,["Nullable","Unique and NOT NULL","Duplicated","Always text"],1,"Primary key uniquely identifies each row and cannot be NULL.","Primary key unique اور NOT NULL ہونا ضروری ہے۔"],
  ["db","db-keys",2,"A foreign key is used to…",undefined,["Encrypt data","Link to a primary key in another table","Sort rows","Create indexes only"],1,"It enforces a relationship between two tables.","Foreign key دوسری table کی primary key سے تعلق بناتا ہے۔"],
  ["db","db-norm",2,"Normalization mainly reduces…",undefined,["Query speed always","Data redundancy and anomalies","Number of users","Storage of indexes"],1,"Normal forms remove duplicate data and update anomalies.","Normalization سے redundancy اور anomalies کم ہوتے ہیں۔"],
  ["db","db-norm",3,"A table is in 1NF if…",undefined,["It has no primary key","All values are atomic (no repeating groups)","It has no foreign keys","It is fully denormalized"],1,"First Normal Form requires atomic, single-valued cells.","1NF میں ہر cell میں atomic (ایک ہی) value ہونی چاہیے۔"],
  ["db","db-join",2,"Which JOIN returns only matching rows from both tables?",undefined,["LEFT JOIN","RIGHT JOIN","INNER JOIN","FULL OUTER JOIN"],2,"INNER JOIN keeps rows that match on both sides.","INNER JOIN صرف دونوں طرف match ہونے والی rows دیتا ہے۔"],
  ["db","db-join",3,"ACID in transactions stands for Atomicity, Consistency, Isolation and…",undefined,["Durability","Dependency","Duplication","Distribution"],0,"Durability means committed data survives failures.","ACID کا D = Durability، یعنی commit شدہ data failure کے بعد بھی محفوظ رہتا ہے۔"],
  // OS
  ["os","os-proc",1,"A process is best defined as…",undefined,["A file on disk","A program in execution","A CPU register","A network packet"],1,"A process is a running instance of a program with its own state.","Process، execution میں موجود program کو کہتے ہیں۔"],
  ["os","os-proc",2,"Threads within the same process share…",undefined,["Nothing","Address space / memory","Only registers","Separate code always"],1,"Threads share memory but have their own stack/registers.","ایک process کے threads memory share کرتے ہیں۔"],
  ["os","os-sched",2,"Round Robin scheduling is fair mainly because…",undefined,["It runs longest job first","Each process gets a fixed time quantum","It never preempts","It uses no queue"],1,"Every process receives an equal time slice in turn.","Round Robin میں ہر process کو برابر time quantum ملتا ہے۔"],
  ["os","os-sched",3,"Which scheduling algorithm can cause starvation for long jobs?",undefined,["Round Robin","FCFS only","Shortest Job First","Round Robin with large quantum"],2,"SJF keeps preferring short jobs; long jobs may wait indefinitely.","SJF میں لمبی jobs مسلسل پیچھے رہ سکتی ہیں — starvation۔"],
  ["os","os-mem",2,"Paging divides memory into fixed-size blocks called…",undefined,["Segments","Pages and frames","Clusters","Packets"],1,"Logical pages map to physical frames.","Paging میں pages اور frames fixed-size ہوتے ہیں۔"],
  ["os","os-mem",3,"Virtual memory allows programs to…",undefined,["Run without RAM","Use more memory than physical RAM via disk","Disable paging","Run only in kernel mode"],1,"Pages are swapped between RAM and disk as needed.","Virtual memory، RAM سے زیادہ memory کا تاثر دیتی ہے (disk کی مدد سے)۔"],
  ["os","os-dead",2,"Deadlock requires mutual exclusion, hold-and-wait, no preemption and…",undefined,["Paging","Circular wait","Virtual memory","Multithreading"],1,"All four Coffman conditions must hold together.","Deadlock کے لیے چوتھی شرط circular wait ہے۔"],
  ["os","os-dead",3,"Banker's algorithm is a deadlock…",undefined,["Detection only","Avoidance algorithm","Recovery tool","Scheduling algorithm"],1,"It avoids unsafe states before granting resources.","Banker's algorithm deadlock avoidance کے لیے ہے۔"],
  // CN
  ["cn","cn-osi",1,"Which OSI layer is responsible for routing packets between networks?",undefined,["Physical","Data Link","Network","Application"],2,"The Network layer (Layer 3) handles logical addressing and routing.","Routing کا کام Network layer (Layer 3) کا ہے۔"],
  ["cn","cn-osi",2,"Encryption and data formatting typically belong to which OSI layer?",undefined,["Session","Presentation","Transport","Network"],1,"Presentation layer handles syntax, encryption and compression.","Presentation layer encryption اور formatting سنبھالتی ہے۔"],
  ["cn","cn-ip",1,"How many bits are in an IPv4 address?",undefined,["32 bits","64 bits","128 bits","16 bits"],0,"IPv4 uses 32-bit addresses (e.g., 192.168.1.1).","IPv4 address 32 bits کا ہوتا ہے۔"],
  ["cn","cn-ip",2,"192.168.1.10 is an example of a…",undefined,["Public IP only","Private IP address","MAC address","IPv6 address"],1,"192.168.x.x is reserved for private networks.","192.168.x.x private network کے لیے مخصوص ہے۔"],
  ["cn","cn-tcp",1,"TCP differs from UDP because TCP is…",undefined,["Faster always","Connection-oriented and reliable","Only for video","Connectionless"],1,"TCP uses handshakes, acknowledgements and retransmission.","TCP connection-oriented اور reliable ہے۔"],
  ["cn","cn-tcp",2,"TCP connection starts with a…",undefined,["Four-way close","Three-way handshake","Single packet","DNS query"],1,"SYN → SYN-ACK → ACK establishes the connection.","TCP تین طرفہ handshake (SYN, SYN-ACK, ACK) سے شروع ہوتا ہے۔"],
  ["cn","cn-app",1,"DNS is mainly used to…",undefined,["Send email","Translate domain names to IP addresses","Encrypt traffic","Assign MAC addresses"],1,"DNS resolves names like google.com to IPs.","DNS domain name کو IP address میں بدلتا ہے۔"],
  ["cn","cn-app",2,"Which protocol automatically assigns IP addresses to devices?",undefined,["DNS","DHCP","FTP","SMTP"],1,"DHCP leases IP configuration to clients automatically.","DHCP خودکار طور پر IP address assign کرتا ہے۔"],
  // SE
  ["se","se-sdlc",1,"Agile development primarily emphasizes…",undefined,["Freezing requirements early","Iterative delivery and customer feedback","No documentation ever","One final release only"],1,"Agile works in iterations with continuous feedback.","Agile میں iterative delivery اور feedback اہم ہے۔"],
  ["se","se-sdlc",2,"In Scrum, a fixed-length iteration is called a…",undefined,["Milestone","Sprint","Waterfall phase","Build"],1,"Sprints are typically 1–4 weeks long.","Scrum میں fixed-length iteration کو Sprint کہتے ہیں۔"],
  ["se","se-test",1,"Unit testing focuses on…",undefined,["Whole system only","Smallest testable parts (functions/modules)","User acceptance","Network speed"],1,"Unit tests verify individual components in isolation.","Unit testing چھوٹے حصوں (functions/modules) کو الگ جانچتی ہے۔"],
  ["se","se-test",2,"Black-box testing means testing…",undefined,["With full code knowledge","Without knowledge of internal code","Only databases","Only performance"],1,"Testers check inputs/outputs without seeing internals.","Black-box میں اندرونی code دیکھے بغیر input/output جانچا جاتا ہے۔"],
  ["se","se-git",1,"In Git, a branch is used to…",undefined,["Delete history","Develop features independently","Encrypt code","Compile code"],1,"Branches let you work in parallel without disturbing main.","Branch سے feature الگ خط پر محفوظ طریقے سے بنتا ہے۔"],
  ["se","se-git",2,"A merge conflict occurs when…",undefined,["Internet is slow","Same lines are changed in two branches","Repo is cloned","Tests fail"],1,"Git cannot auto-merge competing edits to the same lines.","ایک ہی lines دونوں branches میں بدلیں تو merge conflict آتا ہے۔"],
  ["se","se-design",2,"High cohesion and low coupling generally make software…",undefined,["Harder to change","Easier to maintain","Slower always","Impossible to test"],1,"Focused modules with few dependencies are easier to maintain.","High cohesion + low coupling = آسان maintenance۔"],
  ["se","se-design",3,"The 'S' in SOLID stands for…",undefined,["Simple design","Single Responsibility Principle","Software reuse","Static typing"],1,"A class should have one reason to change.","SOLID کا S = Single Responsibility Principle۔"],
  // DM
  ["dm","dm-logic",1,"If p is TRUE and q is FALSE, then p AND q is…",undefined,["True","False","Unknown","Both"],1,"AND is true only when both operands are true.","AND تبھی true ہوتا ہے جب دونوں true ہوں۔"],
  ["dm","dm-logic",2,"p → q is FALSE only when…",undefined,["p false, q true","p true, q false","Both false","Both true"],1,"Implication fails only when a true premise leads to a false conclusion.","p → q صرف تب false ہے جب p true اور q false ہو۔"],
  ["dm","dm-sets",1,"A ∪ B contains elements that are…",undefined,["In both A and B only","In A or B (or both)","In neither","Only in B"],1,"Union collects everything from both sets.","Union میں A یا B (یا دونوں) کے تمام عناصر آتے ہیں۔"],
  ["dm","dm-sets",2,"If |A| = 5 and |B| = 3 and A∩B is empty, then |A ∪ B| = ?",undefined,["8","15","2","5"],0,"Disjoint sets: 5 + 3 = 8.","مشترکہ عنصر نہ ہو تو 5+3 = 8۔"],
  ["dm","dm-func",2,"A function that is both injective and surjective is called…",undefined,["Constant","Bijective","Even","Recursive"],1,"Bijective functions have perfect one-to-one correspondence.","Injective + Surjective = Bijective۔"],
  ["dm","dm-func",3,"A function f is injective if…",undefined,["Every output has an input","Different inputs never give same output","It is onto","Domain equals codomain"],1,"One-to-one: distinct inputs map to distinct outputs.","Injective میں مختلف inputs کی outputs بھی مختلف ہوتی ہیں۔"],
  ["dm","dm-comb",2,"In how many ways can 4 students stand in a line?",undefined,["4","12","24","16"],2,"Permutations: 4! = 4×3×2×1 = 24.","ترتیب کے طریقے: 4! = 24۔"],
  ["dm","dm-comb",3,"Choosing 2 class representatives from 5 students (order doesn't matter) gives…",undefined,["20","10","25","5"],1,"C(5,2) = 5!/(2!·3!) = 10.","C(5,2) = 10 — ترتیب اہم نہیں۔"],
  // AI
  ["ai","ai-search",1,"Breadth-First Search explores nodes…",undefined,["Deepest first","Level by level","Randomly","By cost only"],1,"BFS uses a queue to expand level by level.","BFS queue استعمال کر کے level by level تلاش کرتا ہے۔"],
  ["ai","ai-search",2,"Depth-First Search uses which data structure internally?",undefined,["Queue","Stack","Heap only","Graph only"],1,"DFS is naturally implemented with a stack/recursion.","DFS میں stack (یا recursion) استعمال ہوتا ہے۔"],
  ["ai","ai-search",3,"A* search uses f(n) = ?",undefined,["g(n) only","h(n) only","g(n) + h(n)","g(n) − h(n)"],2,"Actual cost so far plus heuristic estimate to goal.","A* میں f = g (اصل لاگت) + h (تخمینہ)۔"],
  ["ai","ai-kr",2,"An intelligent agent perceives its environment through…",undefined,["Actuators","Sensors","Databases only","Compilers"],1,"Sensors perceive; actuators act.","Agent sensors سے ماحول دیکھتا اور actuators سے عمل کرتا ہے۔"],
  ["ai","ai-kr",1,"'If it rains then roads are wet' is an example of…",undefined,["A neural network","A production rule / implication","Regression","Clustering"],1,"Rule-based knowledge uses if-then implications.","If-then قاعدہ rule-based knowledge representation ہے۔"],
  ["ai","ai-ml",1,"Supervised learning requires…",undefined,["No data","Labelled training data","Only images","Reinforcement signals only"],1,"Models learn from input-output examples.","Supervised learning میں labelled data درکار ہوتا ہے۔"],
  ["ai","ai-ml",2,"Overfitting means a model…",undefined,["Understands everything","Memorizes training data but fails on new data","Trains too slowly","Uses no parameters"],1,"It performs well on training data, poorly on unseen data.","Overfitting: training data یاد، نئے data پر ناکامی۔"],
  ["ai","ai-ml",3,"Clustering (e.g., K-Means) is an example of…",undefined,["Supervised learning","Unsupervised learning","Reinforcement learning","Regression"],1,"No labels are provided; groups are discovered.","Clustering unsupervised ہے — labels نہیں دیے جاتے۔"],
  // COA
  ["coa","coa-bin",1,"Binary 1010 in decimal is…",undefined,["8","10","12","5"],1,"8 + 0 + 2 + 0 = 10.","1010 = 8+2 = 10۔"],
  ["coa","coa-bin",2,"How many distinct values can 8 bits represent?",undefined,["8","128","256","512"],2,"2^8 = 256 values (0–255).","8 bits سے 2^8 = 256 قدریں بنتی ہیں۔"],
  ["coa","coa-bin",2,"Hexadecimal digit 'F' equals decimal…",undefined,["10","12","15","16"],2,"Hex digits run 0–9 then A=10 … F=15.","Hex میں F = 15۔"],
  ["coa","coa-cpu",1,"The correct order of the instruction cycle is…",undefined,["Execute → Fetch → Decode","Fetch → Decode → Execute","Decode → Execute → Fetch","Fetch → Execute → Decode"],1,"CPU fetches, decodes, then executes each instruction.","ترتیب: Fetch → Decode → Execute۔"],
  ["coa","coa-cpu",2,"Which register holds the address of the next instruction?",undefined,["Accumulator","Program Counter (PC)","Stack pointer only","MAR only"],1,"The PC always points to the next instruction to fetch.","Program Counter اگلی instruction کا address رکھتا ہے۔"],
  ["coa","coa-mem",1,"Which memory is fastest (closest to CPU)?",undefined,["Hard disk","RAM","Cache","Cloud storage"],2,"Cache sits closest to the CPU in the hierarchy.","Cache CPU کے قریب ترین اور تیز ترین ہوتی ہے۔"],
  ["coa","coa-mem",3,"A cache hit occurs when…",undefined,["Data is on disk","Needed data is found in cache","RAM is full","CPU is idle"],1,"Found in cache = hit; otherwise a miss fetches from RAM.","Data cache میں مل جائے تو hit، ورنہ miss۔"],
];

const seen = new Set(R.map(r => r[3].toLowerCase()));
const ROWS: Row[] = [...R, ...EXTRA_ROWS.filter(r => !seen.has(r[3].toLowerCase()))];
export { GLOSSARY } from "./extra";
export const QUESTIONS: Question[] = ROWS.map((r, i) => ({
  id: `q${i + 1}`, subjectId: r[0], topicId: r[1], type: "mcq", prompt: r[3], code: r[4],
  options: r[5], correct: r[6], explanation: r[7], explanationUr: r[8], difficulty: r[2],
  source: "CampusXP Reviewed Seed Bank v1", verified: true,
}));

export const CODE_QUESTIONS: Question[] = [
  { id: "c1", subjectId: "pf", topicId: "pf-loop", type: "output", prompt: "Predict the output:", code: "int s = 0;\nfor (int i = 1; i <= 3; i++) s = s + i;\nprint(s);", options: ["3", "6", "5", "Error"], correct: 1, explanation: "s = 1+2+3 = 6.", explanationUr: "s = 1+2+3 = 6۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
  { id: "c2", subjectId: "pf", topicId: "pf-cond", type: "bug", prompt: "Find the bug. Goal: check if x equals 10.", code: "if (x = 10)\n  print(\"equal\");", options: ["No bug", "= assigns 10 instead of comparing; use ==", "print is wrong", "Semicolon missing in if"], correct: 1, explanation: "x = 10 assigns a value (always truthy). Comparison needs ==.", explanationUr: "= سے value assign ہوتی ہے؛ موازنہ کے لیے == چاہیے۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
  { id: "c3", subjectId: "dsa", topicId: "dsa-stack", type: "output", prompt: "Predict the final top of stack:", code: "push(4); push(7); pop(); push(1);", options: ["7", "4", "1", "Empty"], correct: 2, explanation: "pop removes 7, then 1 is pushed — top is 1.", explanationUr: "pop سے 7 نکلا، پھر 1 آیا — اوپر 1 ہے۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
  { id: "c4", subjectId: "pf", topicId: "pf-func", type: "output", prompt: "Predict the output:", code: "int f(int x) { return x * 2; }\nprint(f(5) + 1);", options: ["10", "11", "51", "Error"], correct: 1, explanation: "f(5)=10, plus 1 = 11.", explanationUr: "f(5)=10، جمع 1 = 11۔", difficulty: 2, source: "CampusXP Code Arena", verified: true },
  { id: "c5", subjectId: "dsa", topicId: "dsa-tree", type: "bug", prompt: "Find the bug in this factorial function:", code: "int fact(int n) {\n  return n * fact(n - 1);\n}", options: ["Wrong operator", "Missing base case — infinite recursion", "Return type wrong", "Parentheses wrong"], correct: 1, explanation: "Without a base case (n==0), recursion never stops and overflows the stack.", explanationUr: "Base case نہ ہو تو recursion کبھی نہیں رکتی — stack overflow۔", difficulty: 2, source: "CampusXP Code Arena", verified: true },
  { id: "c6", subjectId: "pf", topicId: "pf-loop", type: "arrange", prompt: "Arrange the blocks to print numbers 1 to 3:", code: undefined, blocks: ["for (int i = 1; i <= 3; i++) {", "print(i);", "}"], options: ["for-line → print → }", "print → for-line → }", "} → for-line → print", "for-line → } → print"], correct: 0, explanation: "Loop header opens the block, body prints, closing brace ends the loop.", explanationUr: "پہلے loop header، پھر print، آخر میں بند bracket۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
  { id: "c7", subjectId: "oop", topicId: "oop-class", type: "pseudo", prompt: "Pseudocode: 'Student s = new Student(); s.setName(\"Ali\");' — What is s?", code: "Student s = new Student();\ns.setName(\"Ali\");", options: ["A class", "An object (instance) of Student", "A primitive int", "A static method"], correct: 1, explanation: "new Student() creates an object; s refers to that instance.", explanationUr: "new Student() سے object بنتا ہے؛ s اسی instance کو کہتے ہیں۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
  { id: "c8", subjectId: "pf", topicId: "pf-var", type: "output", prompt: "Predict the output:", code: "int a = 5;\nint b = a++;\nprint(b);", options: ["6", "5", "4", "Error"], correct: 1, explanation: "Post-increment: b gets the old value 5, then a becomes 6.", explanationUr: "a++ میں پہلے پرانی value (5) ملتی ہے، پھر a بڑھتا ہے۔", difficulty: 3, source: "CampusXP Code Arena", verified: true },
  { id: "c9", subjectId: "db", topicId: "db-sql", type: "bug", prompt: "Find the bug. Goal: select students with marks greater than 80.", code: "SELECT * FROM Students\nWHERE marks = > 80;", options: ["* is wrong", "Operator order wrong: should be marks > 80, not = >", "Table name wrong", "Missing semicolon only"], correct: 1, explanation: "Comparison operator is > placed before the value: marks > 80.", explanationUr: "درست ترتیب: marks > 80 — پہلے operator پھر value۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
  { id: "c10", subjectId: "pf", topicId: "pf-loop", type: "output", prompt: "Predict the output:", code: "int i = 0;\nwhile (i < 3) {\n  print(i);\n  i++;\n}", options: ["0 1 2", "1 2 3", "0 1 2 3", "Infinite loop"], correct: 0, explanation: "Prints 0, 1, 2 then i=3 stops the loop.", explanationUr: "0, 1, 2 چھپے گا؛ i=3 پر loop رک جائے گا۔", difficulty: 2, source: "CampusXP Code Arena", verified: true },
  { id: "c11", subjectId: "dsa", topicId: "dsa-arr", type: "pseudo", prompt: "Pseudocode for finding the maximum in an array starts with…", code: "max = arr[0]\nfor each x in arr: if x > max: max = x", options: ["max = 0 always works", "max = arr[0] then compare each element", "Sort the array first (only way)", "max = last element"], correct: 1, explanation: "Initialize with the first element so negative arrays also work.", explanationUr: "max کو arr[0] سے شروع کریں تاکہ منفی numbers پر بھی درست رہے۔", difficulty: 2, source: "CampusXP Code Arena", verified: true },
  { id: "c12", subjectId: "pf", topicId: "pf-cond", type: "arrange", prompt: "Arrange blocks to build a correct if-else that prints Pass/Fail:", code: undefined, blocks: ["if (marks >= 50) { print(\"Pass\"); }", "else { print(\"Fail\"); }"], options: ["if-block → else-block", "else-block → if-block", "Only if-block needed", "Order doesn't matter"], correct: 0, explanation: "else must follow its if block — it cannot stand first.", explanationUr: "else ہمیشہ if کے بعد آتا ہے، پہلے نہیں آ سکتا۔", difficulty: 1, source: "CampusXP Code Arena", verified: true },
];

export const ALL_QUESTIONS = [...QUESTIONS, ...CODE_QUESTIONS];
export const subjectById = (id: string) => SUBJECTS.find(s => s.id === id);
export const topicById = (id: string) => { for (const s of SUBJECTS) { const t = s.topics.find(t => t.id === id); if (t) return t; } return undefined; };
export function questionsFor(subjectId?: string, topicId?: string, pool: Question[] = QUESTIONS): Question[] {
  return pool.filter(q => (!subjectId || q.subjectId === subjectId) && (!topicId || q.topicId === topicId));
}
export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr]; let s = seed ?? Math.floor(Math.random() * 1e9);
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function dailyQuestion(dateStr: string): Question {
  let h = 0; for (const c of dateStr) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return QUESTIONS[h % QUESTIONS.length];
}
