export interface CurriculumTopic {
  id: string;
  number: number;
  title: string;
  category: 'Fundamentals' | 'Control Flow' | 'Functions & Arrays' | 'Memory & Pointers' | 'Advanced C';
  summary: string;
  learningObjectives: string[];
  keyConcepts: string[];
  codeExample: string;
  vivaQuestions: Array<{ q: string; a: string }>;
  commonMistakes: string[];
}

export const C_CURRICULUM: CurriculumTopic[] = [
  {
    id: 'intro_c',
    number: 1,
    title: 'Introduction to C',
    category: 'Fundamentals',
    summary: 'Origins of C by Dennis Ritchie at Bell Labs (1972). Structure of a standard C program, preprocessing, compiling, assembling, and linking stages.',
    learningObjectives: [
      'Understand program execution lifecycle (source code -> preprocessor -> compiler -> assembler -> linker -> binary)',
      'Structure of main() function and return codes',
      'Standard headers and header inclusion (#include <stdio.h>)'
    ],
    keyConcepts: [
      'C is a procedural, statically typed, compiled middle-level language',
      '#include directives are handled before actual syntax compilation',
      'The OS starts execution at main() and checks the integer exit status (0 = success)'
    ],
    codeExample: `// First C Program - Dennis Ritchie Tradition
#include <stdio.h>

int main(void) {
    printf("Welcome to C Tutor AI!\\n");
    printf("B.Tech Computer Engineering Curriculum\\n");
    return 0; // Exit status 0 signals clean termination to OS
}`,
    vivaQuestions: [
      { q: 'Why is return 0 used in main()?', a: 'Return 0 communicates to the operating system shell that the program terminated successfully without any unhandled faults.' },
      { q: 'What is the role of the linker in C?', a: 'The linker combines object code files (.o) with standard library implementations (like libc for printf) into an executable binary.' }
    ],
    commonMistakes: [
      'Writing void main() in standard C (violates ISO C standards; standard requires int main())',
      'Omitting #include <stdio.h> when calling printf/scanf'
    ]
  },
  {
    id: 'vars_datatypes',
    number: 2,
    title: 'Variables and Data Types',
    category: 'Fundamentals',
    summary: 'Primitive data types (int, char, float, double), modifiers (signed, unsigned, short, long), sizeof operator, and IEEE-754 representation.',
    learningObjectives: [
      'Identify memory footprints and ranges of primitive types',
      'Use the sizeof operator correctly on types and variables',
      'Understand signed vs unsigned 2s complement binary representations'
    ],
    keyConcepts: [
      'char is guaranteed to be at least 8 bits (1 byte)',
      'int size is platform-dependent (usually 4 bytes on modern 32/64-bit systems)',
      'Floating points have finite precision: float (single precision ~7 decimal digits), double (double precision ~15 digits)'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    int age = 19;
    char grade = 'A';
    float cgpa = 9.45f;
    double exactScore = 98.7654321;

    printf("int size: %zu bytes, value: %d\\n", sizeof(age), age);
    printf("char size: %zu bytes, value: %c\\n", sizeof(grade), grade);
    printf("float size: %zu bytes, value: %.2f\\n", sizeof(cgpa), cgpa);
    printf("double size: %zu bytes, value: %.7f\\n", sizeof(exactScore), exactScore);
    return 0;
}`,
    vivaQuestions: [
      { q: 'What does the sizeof operator return?', a: 'It evaluates to an unsigned integer value of type size_t representing the size in bytes of its operand.' },
      { q: 'What happens during integer overflow in signed vs unsigned integers?', a: 'Signed overflow is Undefined Behavior in C. Unsigned overflow wraps around modulo 2^N in a defined manner.' }
    ],
    commonMistakes: [
      'Using %d format specifier for double or float (causes incorrect interpretation of stack bytes)',
      'Confusing char literal \'A\' (single quotes) with string literal "A" (double quotes with null terminator)'
    ]
  },
  {
    id: 'input_output',
    number: 3,
    title: 'Input and Output (I/O)',
    category: 'Fundamentals',
    summary: 'Standard I/O stream operations with printf and scanf, conversion specifiers, buffer flushing, and whitespace handling.',
    learningObjectives: [
      'Master format specifiers (%d, %c, %f, %lf, %s, %p, %zu)',
      'Understand address-of operator & in scanf()',
      'Avoid newline trapping and input buffer residue'
    ],
    keyConcepts: [
      'scanf requires pointers to variables so it can mutate them by address',
      'Format string determines exactly how bytes are parsed from standard input stdin',
      'fflush(stdin) is undefined behavior in standard C; consume leftover newlines with a leading space in scanf(" %c", &ch) or getchar()'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    int rollNumber;
    char section;

    printf("Enter roll number: ");
    if (scanf("%d", &rollNumber) != 1) {
        printf("Invalid input!\\n");
        return 1;
    }

    printf("Enter section letter: ");
    // Notice leading space before %c to skip leftover newline in stdin buffer
    scanf(" %c", &section);

    printf("Student registered: Roll %d, Section %c\\n", rollNumber, section);
    return 0;
}`,
    vivaQuestions: [
      { q: 'Why must we pass &x to scanf("%d", &x)?', a: 'C passes arguments strictly by value. To allow scanf to write into variable x, we must pass its memory address (&x).' },
      { q: 'What does scanf() return?', a: 'The number of input items successfully matched and assigned, or EOF on read failure.' }
    ],
    commonMistakes: [
      'Forgetting the & in scanf("%d", &var), causing segmentation fault',
      'Passing & with string array in scanf("%s", str) (array name already evaluates to address of first element)'
    ]
  },
  {
    id: 'operators',
    number: 4,
    title: 'Operators and Expressions',
    category: 'Fundamentals',
    summary: 'Arithmetic, relational, logical, bitwise, assignment, and ternary operators. Operator precedence, associativity, and sequence points.',
    learningObjectives: [
      'Apply operator precedence and associativity rules',
      'Understand short-circuit evaluation in && and ||',
      'Distinguish pre-increment (++i) vs post-increment (i++)'
    ],
    keyConcepts: [
      'Short-circuit evaluation: In expr1 && expr2, if expr1 is 0, expr2 is never evaluated',
      'Integer division truncates towards zero: 7 / 2 evaluates to 3',
      'Modifying a variable multiple times in an unsequenced expression (e.g. i = i++) produces Undefined Behavior'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    int a = 10, b = 3;
    printf("Integer Division: %d / %d = %d\\n", a, b, a / b);
    printf("Modulo: %d %% %d = %d\\n", a, b, a % b);

    // Pre-increment vs Post-increment
    int x = 5, y = 5;
    printf("Post-increment: x++ gives %d, then x is %d\\n", x++, x);
    printf("Pre-increment:  ++y gives %d, then y is %d\\n", ++y, y);

    // Short-circuit demonstration
    int check = 0;
    if (0 && (check = 99)) {
        // Will never execute
    }
    printf("check remains %d due to short-circuit!\\n", check);
    return 0;
}`,
    vivaQuestions: [
      { q: 'What is short-circuit evaluation in C?', a: 'Logical AND (&&) stops evaluating if left operand is false; logical OR (||) stops evaluating if left operand is true.' },
      { q: 'What is the difference between = and ==?', a: '= is the assignment operator; == is the equality relational operator.' }
    ],
    commonMistakes: [
      'Accidental assignment in condition: if (x = 5) instead of if (x == 5)',
      'Assuming float division with integer operands: 5 / 2 yields 2, not 2.5'
    ]
  },
  {
    id: 'conditionals',
    number: 5,
    title: 'Conditional Statements',
    category: 'Control Flow',
    summary: 'Decision making using if, if-else, nested conditions, and switch-case statements with break and default.',
    learningObjectives: [
      'Construct clean decision trees with if-else if ladders',
      'Use switch statements with integer/char expressions',
      'Understand fall-through behavior and the role of break'
    ],
    keyConcepts: [
      'In C, any non-zero value is treated as true, 0 is false',
      'switch expression must evaluate to an integral or enum type',
      'Without break, execution falls through into subsequent case statements'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    char grade = 'B';

    switch (grade) {
        case 'A':
            printf("Outstanding performance!\\n");
            break;
        case 'B':
            printf("Good performance, aim for excellence!\\n");
            break;
        case 'C':
            printf("Satisfactory. Revision recommended.\\n");
            break;
        default:
            printf("Invalid grade entered.\\n");
            break;
    }
    return 0;
}`,
    vivaQuestions: [
      { q: 'Can we use float or string expressions in switch()?', a: 'No. C switch expressions only accept integer or character constants.' },
      { q: 'What is case fall-through?', a: 'If a case lacks a break statement, control executes the statements of the next case sequentially.' }
    ],
    commonMistakes: [
      'Missing break in switch statements, causing unintended execution of lower cases',
      'Placing a semicolon right after if: if (x > 0); { ... }'
    ]
  },
  {
    id: 'loops',
    number: 6,
    title: 'Loops and Iteration',
    category: 'Control Flow',
    summary: 'Entry-controlled (for, while) and exit-controlled (do-while) loops. Nested loops, pattern printing, break, and continue.',
    learningObjectives: [
      'Choose the appropriate loop construct for known vs unknown iteration counts',
      'Implement nested loop algorithms for 2D patterns and matrices',
      'Trace loop boundary conditions and prevent off-by-one errors'
    ],
    keyConcepts: [
      'do-while is guaranteed to execute at least once because condition is checked at the exit point',
      'break terminates the innermost enclosing loop immediately',
      'continue skips remaining statements in the current iteration and tests the loop condition again'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    int rows = 4;

    printf("Inverted Star Pattern:\\n");
    for (int i = rows; i >= 1; i--) {
        for (int j = 1; j <= i; j++) {
            printf("* ");
        }
        printf("\\n");
    }
    return 0;
}`,
    vivaQuestions: [
      { q: 'What is the fundamental difference between while and do-while?', a: 'while is entry-controlled (checks condition before body); do-while is exit-controlled (executes body at least once).' },
      { q: 'What does continue do in a for loop?', a: 'It transfers control directly to the update expression (e.g. i++) of the loop.' }
    ],
    commonMistakes: [
      'Off-by-one errors in loop conditions (e.g., <= n vs < n)',
      'Accidentally placing a semicolon after while: while (i < 5); { i++; } causes an infinite loop'
    ]
  },
  {
    id: 'functions',
    number: 7,
    title: 'Functions and Storage Classes',
    category: 'Functions & Arrays',
    summary: 'Modular programming, function prototypes, call-by-value semantics, recursion base cases, and storage classes (auto, register, static, extern).',
    learningObjectives: [
      'Declare and define functions with precise prototypes',
      'Understand how C strictly passes arguments by value',
      'Formulate recursion with termination base conditions',
      'Use static variables to preserve state across invocations'
    ],
    keyConcepts: [
      'C has no native call-by-reference: passing a pointer is still passing an address value',
      'Stack frames store local variables, parameters, and return addresses',
      'static local variables are initialized once and reside in the data segment throughout program lifetime'
    ],
    codeExample: `#include <stdio.h>

// Function prototype
int factorial(int n);
void swapByPointers(int *a, int *b);

int main(void) {
    int num = 5;
    printf("Factorial of %d = %d\\n", num, factorial(num));

    int x = 10, y = 20;
    printf("Before swap: x=%d, y=%d\\n", x, y);
    swapByPointers(&x, &y);
    printf("After swap:  x=%d, y=%d\\n", x, y);
    return 0;
}

int factorial(int n) {
    if (n <= 1) return 1; // Base condition
    return n * factorial(n - 1);
}

void swapByPointers(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`,
    vivaQuestions: [
      { q: 'Does C have call-by-reference?', a: 'No. C strictly uses call-by-value. Pointers pass memory address values by value, simulating pass-by-reference.' },
      { q: 'What does the static keyword do on a local variable?', a: 'It retains its value across multiple function calls and persists until program termination.' }
    ],
    commonMistakes: [
      'Missing base condition in recursive functions leading to stack overflow',
      'Attempting to return the address of a local automatic stack variable'
    ]
  },
  {
    id: 'arrays',
    number: 8,
    title: '1D and 2D Arrays',
    category: 'Functions & Arrays',
    summary: 'Contiguous memory allocation, indexing, matrix operations (addition, transpose), bounds checking, and array-pointer equivalence.',
    learningObjectives: [
      'Access elements in row-major order contiguous memory',
      'Perform matrix transformations (transpose, multiplication, sum of rows)',
      'Understand lack of array bounds checking in standard C'
    ],
    keyConcepts: [
      'Arrays in C are stored in contiguous memory blocks in row-major order',
      'C compilers do NOT perform bounds checking (reading arr[10] on size 10 is Undefined Behavior)',
      'Matrix transpose swaps row index and column index: B[j][i] = A[i][j]'
    ],
    codeExample: `#include <stdio.h>

#define ROWS 2
#define COLS 3

int main(void) {
    int matrix[ROWS][COLS] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    int transpose[COLS][ROWS];

    // Transpose logic
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            transpose[j][i] = matrix[i][j];
        }
    }

    printf("Original Matrix (2x3):\\n");
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) printf("%d ", matrix[i][j]);
        printf("\\n");
    }

    printf("Transposed Matrix (3x2):\\n");
    for (int i = 0; i < COLS; i++) {
        for (int j = 0; j < ROWS; j++) printf("%d ", transpose[i][j]);
        printf("\\n");
    }
    return 0;
}`,
    vivaQuestions: [
      { q: 'How are 2D arrays stored in memory in C?', a: 'In row-major order, where elements of the first row are placed in contiguous memory, followed immediately by elements of the second row.' },
      { q: 'Why is arr[i] equivalent to *(arr + i)?', a: 'Array subscripting in C is syntactic sugar for pointer addition and dereferencing: arr[i] == *(arr + i) == *(i + arr) == i[arr].' }
    ],
    commonMistakes: [
      'Out of bounds array access (accessing index >= size)',
      'Assigning arrays directly: arr1 = arr2 is invalid in C'
    ]
  },
  {
    id: 'strings',
    number: 9,
    title: 'Strings and String Functions',
    category: 'Functions & Arrays',
    summary: 'Character arrays terminated by the null character (\\0), string manipulation functions in <string.h> (strlen, strcpy, strcmp, strcat).',
    learningObjectives: [
      'Allocate sufficient buffer capacity for the trailing \\0 character',
      'Implement string copy and length without standard library functions',
      'Use safe alternatives to prevent buffer overflows'
    ],
    keyConcepts: [
      'A C string is a 1D char array ending with the null terminator \'\\0\' (ASCII 0)',
      'strlen() returns the number of characters excluding the null terminator',
      'strcmp(s1, s2) returns 0 if equal, negative if s1 < s2, positive if s1 > s2'
    ],
    codeExample: `#include <stdio.h>
#include <string.h>

int main(void) {
    char greeting[30] = "Hello";
    char name[] = " Computer Engineer";

    strcat(greeting, name);
    printf("Combined String: %s\\n", greeting);
    printf("Length: %zu characters\\n", strlen(greeting));

    if (strcmp(greeting, "Hello") == 0) {
        printf("Matches Hello\\n");
    } else {
        printf("Does not match Hello exactly\\n");
    }
    return 0;
}`,
    vivaQuestions: [
      { q: 'What is the purpose of the null character \\0 in strings?', a: 'It marks the end of the string in memory so library functions know where the string terminates.' },
      { q: 'Why is gets() dangerous and removed from modern C?', a: 'It does not perform buffer bounds checks, leading to severe buffer overflow vulnerabilities. fgets() should be used instead.' }
    ],
    commonMistakes: [
      'Forgetting +1 byte for \\0 when sizing string buffers (e.g., char s[5] for "hello" causes overflow)',
      'Using == to compare strings instead of strcmp()'
    ]
  },
  {
    id: 'pointers',
    number: 10,
    title: 'Pointers and Memory Fundamentals',
    category: 'Memory & Pointers',
    summary: 'Memory addresses, address-of operator &, dereference operator *, pointer arithmetic, double pointers, and function pointers.',
    learningObjectives: [
      'Distinguish pointer variable vs the value it points to',
      'Perform pointer arithmetic based on datatype scale factor',
      'Use double pointers (**ptr) to modify pointer variables',
      'Identify and eliminate dangling pointers and NULL dereferences'
    ],
    keyConcepts: [
      'Pointer holds the memory address of another variable',
      'Pointer arithmetic scales by sizeof(type): ptr + 1 advances by sizeof(*ptr) bytes',
      'NULL pointer does not point to valid memory; dereferencing NULL causes an immediate crash/segfault'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    int val = 42;
    int *ptr = &val;
    int **doublePtr = &ptr;

    printf("Value: %d\\n", val);
    printf("Via pointer *ptr: %d\\n", *ptr);
    printf("Via double pointer **doublePtr: %d\\n", **doublePtr);
    printf("Memory address of val: %p\\n", (void*)&val);
    printf("Pointer ptr points to: %p\\n", (void*)ptr);

    // Modifying through pointer
    *ptr = 100;
    printf("Updated val: %d\\n", val);
    return 0;
}`,
    vivaQuestions: [
      { q: 'What is a wild pointer vs a dangling pointer?', a: 'A wild pointer is uninitialized pointing to random memory; a dangling pointer points to memory that has already been deallocated or freed.' },
      { q: 'What is the size of a pointer variable in C?', a: '4 bytes on a 32-bit architecture, and 8 bytes on a 64-bit architecture, regardless of the data type it points to.' }
    ],
    commonMistakes: [
      'Dereferencing uninitialized pointers (*p = 10 without p = &x or malloc)',
      'Confusing * in declaration (type specifier) with * in expressions (dereference)'
    ]
  },
  {
    id: 'structures',
    number: 11,
    title: 'Structures and Unions',
    category: 'Memory & Pointers',
    summary: 'User-defined data types, struct member access, arrow operator ->, typedef, struct padding/alignment, and unions for memory sharing.',
    learningObjectives: [
      'Group heterogeneous data items using struct',
      'Access members via direct dot (.) and indirect arrow (->) operators',
      'Understand how unions share a single memory space for all members'
    ],
    keyConcepts: [
      'struct allocates sufficient memory for all its members simultaneously (plus padding for CPU alignment)',
      'union allocates only as much memory as its largest member; only one member can be safely accessed at a time',
      'typedef creates descriptive type aliases for cleaner engineering code'
    ],
    codeExample: `#include <stdio.h>
#include <string.h>

typedef struct {
    int roll;
    char name[40];
    float marks;
} Student;

int main(void) {
    Student s1 = {101, "Alice Sharma", 89.5f};
    Student *sPtr = &s1;

    printf("Student Info via dot (.):   %s (Roll: %d, Marks: %.1f)\\n", s1.name, s1.roll, s1.marks);
    printf("Student Info via arrow (->): %s (Roll: %d, Marks: %.1f)\\n", sPtr->name, sPtr->roll, sPtr->marks);
    return 0;
}`,
    vivaQuestions: [
      { q: 'What is the key difference in memory allocation between struct and union?', a: 'In a struct, each member has its own separate memory location. In a union, all members share the same memory location, with size equal to the largest member.' },
      { q: 'Why does a structure have padding bytes?', a: 'CPUs access memory faster when data is aligned to word boundaries (e.g. 4-byte multiples for 32-bit integers).' }
    ],
    commonMistakes: [
      'Using the dot operator on a pointer without dereferencing: p.member instead of p->member or (*p).member',
      'Reading from a union member different from the one most recently written'
    ]
  },
  {
    id: 'dynamic_memory',
    number: 12,
    title: 'Dynamic Memory Allocation',
    category: 'Memory & Pointers',
    summary: 'Heap management using malloc, calloc, realloc, and free in <stdlib.h>. Detecting and preventing memory leaks.',
    learningObjectives: [
      'Allocate runtime-sized memory arrays on the heap',
      'Always verify whether malloc returned NULL',
      'Free allocated heap memory to prevent memory leaks'
    ],
    keyConcepts: [
      'malloc(bytes) allocates uninitialized memory; calloc(num, size) zeroes the bytes',
      'realloc(ptr, newSize) expands or contracts existing allocations, moving data if necessary',
      'Every malloc/calloc MUST have a corresponding free() call'
    ],
    codeExample: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *arr = (int*)malloc(n * sizeof(int));

    if (arr == NULL) {
        fprintf(stderr, "Memory allocation failed!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        printf("%d ", arr[i]);
    }
    printf("\\n");

    // Always free dynamic memory
    free(arr);
    arr = NULL; // Prevent dangling pointer
    return 0;
}`,
    vivaQuestions: [
      { q: 'What happens if you do not free allocated memory before program exit?', a: 'It causes a memory leak, consuming system RAM that cannot be reclaimed until the process terminates.' },
      { q: 'What does realloc return if it cannot expand memory?', a: 'It returns NULL, leaving the original block intact; never assign directly: ptr = realloc(ptr, size) without a temporary variable.' }
    ],
    commonMistakes: [
      'Not checking for NULL after malloc()',
      'Using memory after free() (dangling pointer access)',
      'Double freeing memory (calling free() twice on same pointer)'
    ]
  },
  {
    id: 'file_handling',
    number: 13,
    title: 'File Handling in C',
    category: 'Advanced C',
    summary: 'Stream I/O with FILE pointers: fopen, fclose, fprintf, fscanf, fgetc, fputs, fread, and fwrite. Text vs binary file modes.',
    learningObjectives: [
      'Open and close files safely checking for NULL file pointers',
      'Read and write structured text using fprintf and fscanf',
      'Read and write binary records using fread and fwrite'
    ],
    keyConcepts: [
      'FILE structure in <stdio.h> maintains file stream state, position pointer, and buffers',
      'File access modes: "r" (read), "w" (write/overwrite), "a" (append), "rb"/"wb" (binary modes)',
      'fclose() flushes pending buffers and releases OS file descriptors'
    ],
    codeExample: `#include <stdio.h>

int main(void) {
    FILE *fp = fopen("output.txt", "w");
    if (fp == NULL) {
        printf("Error opening file!\\n");
        return 1;
    }

    fprintf(fp, "C Tutor AI - College Exam Notes\\n");
    fprintf(fp, "File handling completed successfully.\\n");
    fclose(fp);

    printf("File written and closed safely.\\n");
    return 0;
}`,
    vivaQuestions: [
      { q: 'What does EOF represent in C file operations?', a: 'End Of File, an integer constant defined in <stdio.h> (usually -1) returned when no more data can be read from a stream.' },
      { q: 'Why is it crucial to call fclose() on an opened file?', a: 'It flushes buffered output to disk and releases the operating system file descriptor handle.' }
    ],
    commonMistakes: [
      'Forgetting to check if fopen() returned NULL before reading/writing',
      'Using feof() in a loop condition before performing a read operation'
    ]
  },
  {
    id: 'searching_sorting',
    number: 14,
    title: 'Searching and Sorting Algorithms',
    category: 'Advanced C',
    summary: 'Linear search (O(n)), Binary search (O(log n)), Bubble sort, Selection sort, and Insertion sort implemented in C.',
    learningObjectives: [
      'Implement binary search iteratively and recursively on sorted arrays',
      'Analyze time and space complexity in big-O notation',
      'Implement bubble sort with early-stopping swap flag'
    ],
    keyConcepts: [
      'Linear search works on unsorted collections; binary search requires sorted array',
      'Binary search splits search space in half each iteration (O(log n))',
      'Bubble sort repeatedly swaps adjacent out-of-order elements (O(n^2))'
    ],
    codeExample: `#include <stdio.h>

int binarySearch(int arr[], int size, int target) {
    int low = 0, high = size - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // Prevents integer overflow
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not found
}

int main(void) {
    int numbers[] = {11, 23, 34, 45, 67, 89, 92};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    int target = 45;

    int idx = binarySearch(numbers, size, target);
    if (idx != -1) {
        printf("Found target %d at index %d\\n", target, idx);
    } else {
        printf("Target not found\\n");
    }
    return 0;
}`,
    vivaQuestions: [
      { q: 'Why write mid = low + (high - low) / 2 instead of (low + high) / 2?', a: 'To prevent integer overflow when low + high exceeds maximum allowable int value.' },
      { q: 'What is the best case time complexity of optimized Bubble Sort?', a: 'O(n), achieved when the array is already sorted and an early-exit flag detects no swaps on the first pass.' }
    ],
    commonMistakes: [
      'Applying binary search on unsorted arrays',
      'Incorrect calculation of mid pointer causing infinite loops'
    ]
  },
  {
    id: 'basic_data_structures',
    number: 15,
    title: 'Basic Data Structures in C',
    category: 'Advanced C',
    summary: 'Singly linked lists, node structures, stacks using arrays and pointers, queues, and dynamic node linking.',
    learningObjectives: [
      'Construct linked list node structures using self-referential structs',
      'Implement node insertion at head and traversal',
      'Understand stack operations: push, pop, peek, and overflow/underflow'
    ],
    keyConcepts: [
      'Linked lists allow dynamic insertion and deletion without shifting elements',
      'Self-referential struct contains a pointer to a struct of the same type',
      'Stack follows LIFO (Last In First Out) principle; Queue follows FIFO'
    ],
    codeExample: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

void printList(Node *head) {
    Node *curr = head;
    while (curr != NULL) {
        printf("%d -> ", curr->data);
        curr = curr->next;
    }
    printf("NULL\\n");
}

int main(void) {
    Node *head = (Node*)malloc(sizeof(Node));
    Node *second = (Node*)malloc(sizeof(Node));

    head->data = 10;
    head->next = second;

    second->data = 20;
    second->next = NULL;

    printf("Linked List: ");
    printList(head);

    free(second);
    free(head);
    return 0;
}`,
    vivaQuestions: [
      { q: 'What is a self-referential structure?', a: 'A structure definition that contains one or more pointers pointing to an instance of the same structure type, fundamental for linked lists and trees.' },
      { q: 'What are the main advantages of a linked list over an array?', a: 'Dynamic size allocation at runtime and constant O(1) time insertion/deletion when pointer to node is available.' }
    ],
    commonMistakes: [
      'Losing head pointer during list traversal',
      'Freeing a node before caching its next pointer: curr = curr->next after free(curr)'
    ]
  },
  {
    id: 'advanced_c',
    number: 16,
    title: 'Advanced C: Bitwise & Preprocessor',
    category: 'Advanced C',
    summary: 'Bitwise operators (&, |, ^, ~, <<, >>), bit masks, macros (#define, #ifdef), macro pitfalls, and command-line arguments (argc, argv).',
    learningObjectives: [
      'Manipulate individual bits for flags and low-level drivers',
      'Write safe parameterized macros with parentheses',
      'Process command-line arguments using argc and argv'
    ],
    keyConcepts: [
      'Left shift (x << k) multiplies by 2^k; Right shift (x >> k) divides by 2^k',
      'Macros perform textual substitution before compilation; always wrap arguments in parentheses: #define SQUARE(x) ((x) * (x))',
      'argc contains total argument count (including program executable path in argv[0])'
    ],
    codeExample: `#include <stdio.h>

#define SET_BIT(num, pos) ((num) |= (1U << (pos)))
#define CLEAR_BIT(num, pos) ((num) &= ~(1U << (pos)))
#define CHECK_BIT(num, pos) (((num) >> (pos)) & 1U)

int main(int argc, char *argv[]) {
    printf("Program launched: %s with %d arguments\\n", argv[0], argc);

    unsigned char flags = 0; // 0000 0000
    SET_BIT(flags, 3);       // 0000 1000 = 8

    printf("Flags after setting bit 3: %u\\n", flags);
    printf("Is bit 3 set? %s\\n", CHECK_BIT(flags, 3) ? "YES" : "NO");

    CLEAR_BIT(flags, 3);
    printf("Is bit 3 set after clear? %s\\n", CHECK_BIT(flags, 3) ? "YES" : "NO");
    return 0;
}`,
    vivaQuestions: [
      { q: 'Why must macro arguments be enclosed in parentheses?', a: 'To prevent operator precedence errors during textual expansion, e.g. #define MUL(a,b) a*b evaluates MUL(1+2, 3) as 1+2*3 = 7 instead of 9.' },
      { q: 'What does argv[0] always contain?', a: 'The string representing the name or path used to invoke the program executable.' }
    ],
    commonMistakes: [
      'Using bitwise AND (&) when logical AND (&&) was intended',
      'Macros with side-effects: SQUARE(x++) causes x to be incremented twice'
    ]
  }
];
