/* C 语言笔记 · 第 1~2 章：入门 / 变量与运算
   每篇结构：c 章 · t 标题 · d 摘要 · body 正文 · code 示例 · out 输出 · tips 易错点 */
window.C_NOTES = (window.C_NOTES || []).concat([

/* ================= 第 1 章 入门 ================= */
{c:"🚀 第 1 章 入门：程序是怎么跑起来的",
t:"01 从源代码到可执行文件：预处理 / 编译 / 汇编 / 链接",
d:"你写的是文本，CPU 只认机器码，中间隔着四道工序。搞懂这四步，90% 的「undefined reference」类报错都能自己定位。",
body:[
"p:你在编辑器里敲的 .c 文件叫**源文件**，本质只是一段 UTF-8 文本，CPU 完全看不懂。从文本到能双击运行的程序，要经过四个阶段，gcc 一条命令背后其实调用了四套工具。",
"h:四个阶段分别干了什么",
"ul:预处理（cpp）：展开 #include 头文件、替换 #define 宏、删掉注释。产物仍是 C 代码，后缀 .i|编译（cc1）：把 C 代码翻译成汇编语言，做语法检查、类型检查。这一步报的错才是真正的「语法错误」|汇编（as）：把汇编翻译成机器指令，产出二进制目标文件 .o|链接（ld）：把你的 .o 和库里的 .o 拼起来，填好函数地址，产出可执行文件",
"p:关键点在于：**编译是以单个 .c 文件为单位的**。编译器看不到别的 .c 文件里有什么，所以调用别处定义的函数必须先有声明（函数原型），这就是头文件存在的理由。",
"h:两个阶段的报错长什么样",
"ul:编译错误：error: expected ';' before '}' token —— 语法没过，改代码|链接错误：undefined reference to 'add' —— 语法没问题，但找不到 add 的实现，通常是没有一起编译 add.c，或者函数名拼错",
"note:分步执行：gcc -E a.c -o a.i（只看预处理）、gcc -S a.c（出汇编 a.s）、gcc -c a.c（出 a.o）、gcc a.o -o a（链接）。四个文件对比着看一遍，比看十篇文章管用。"
],
code:`// 分步观察四个阶段（Linux / macOS 终端）
gcc -E hello.c -o hello.i     // 1. 预处理：宏展开、头文件铺开
gcc -S hello.i -o hello.s     // 2. 编译：生成汇编
gcc -c hello.s -o hello.o     // 3. 汇编：生成目标文件
gcc hello.o -o hello          // 4. 链接：生成可执行文件

// 一条命令等价写法
gcc hello.c -o hello

// 多个源文件必须一起交给链接器
gcc main.c add.c -o app`,
out:`$ gcc hello.c -o hello
$ ./hello
Hello, World!`,
tips:["只编译不链接：gcc -c 可以单独检查语法，改大项目时先 -c 能快速定位是哪个文件挂了。",
"链接错误不要盯着报错那一行，去看「被谁引用了、那个符号到底有没有定义」。",
"-Wall 一定要加：很多低级错误默认不报警告，加上后编译期就能拦住。"]},

{t:"02 拆开第一个 C 程序：每一行到底在干什么",
d:"#include 不是「导入库」，main 不是随便起的名字，return 0 也不是走个形式。逐行拆一遍。",
body:[
"p:几乎所有教材的第一个程序都是 Hello World，但很少有人把每一行讲清楚。下面这 7 行代码，藏着 5 个必知概念。",
"h:逐行解释",
"ul:#include <stdio.h>：预处理指令，把 stdio.h 的内容原样粘到这里。stdio = standard input/output，printf 的声明就在里面|int main(void)：程序的唯一入口。操作系统启动程序后，第一个调用的就是你写的 main|{ }：函数体，语句的集合|printf(\"Hello\\n\")：调用库函数往标准输出写字符串，\\n 是换行符|return 0：把 0 返回给操作系统，约定 0 表示正常结束，非 0 表示出错",
"h:main 的三种合法写法",
"ul:int main(void) —— 不接受参数，最推荐|int main() —— 老写法，等价但不严谨|int main(int argc, char *argv[]) —— 接收命令行参数，写命令行工具时用",
"p:注意 main 的返回类型必须是 int，写成 void main() 是早年教科书的坏习惯，C 标准里根本没有这种形式，很多编译器会直接报警告。",
"note:分号是语句结束符，不是行结束符。C 语言允许一行写多条语句，也允许一条语句跨多行——但为了可读性，别这么干。"
],
code:`#include <stdio.h>      // 预处理：引入 printf 的声明

int main(void)          // 程序入口，返回 int
{
    printf("Hello, World!\\n");   // \\n 换行
    return 0;           // 0 = 正常结束
}`,
out:`Hello, World!`,
tips:["中文输入法打出的全角分号「；」、全角引号「“”」，编译器会报 stray '\\357' in program 之类的怪错——看到乱码报错先查输入法。",
"忘记 #include <stdio.h> 时，printf 会被当成未声明函数，C99 之后直接报错。"],
see:["01 从源代码到可执行文件"]},

{t:"03 进制与内存：为什么要有二进制、八进制、十六进制",
d:"计算机只认 0 和 1。十六进制不是玄学，它只是二进制的「缩写版」：一位十六进制正好对应四位二进制。",
body:[
"p:内存是一大片格子，每个格子存 0 或 1（一个 bit）。8 个 bit 组成 1 个字节（byte），这是 C 里 char 的大小，也是内存寻址的最小单位。",
"h:三种进制的写法与换算",
"ul:二进制 0b1010（C99 起支持），每位的权重是 2 的幂|八进制 0 开头，如 0755，常用于文件权限|十六进制 0x 开头，如 0xFF，因为 1 位十六进制 = 4 位二进制，写地址、看内存时最方便",
"p:换算不用记公式，记住 **8421 表**：一个十六进制位拆成 8 4 2 1 四个二进制位。比如 0xA = 1010，0xF = 1111，所以 0xAF = 1010 1111。反过来两位一组往上并就行。",
"h:负数是怎么存的：补码",
"p:C 语言用**补码**表示有符号整数。规则很简单：正数照常写，负数 = 取反加一。以 8 位的 -1 为例：1 是 0000 0001，取反 1111 1110，加一 1111 1111，也就是 0xFF。",
"p:补码的好处是**加减法可以统一用加法电路实现**：1 + (-1) = 0000 0001 + 1111 1111 = 1 0000 0000，最高位溢出丢掉，剩下 0000 0000 = 0，结果正确。这就是为什么计算机不用单独做减法器。",
"note:printf 打印不同进制：%d 十进制、%o 八进制、%x 小写十六进制、%X 大写、%#x 带 0x 前缀。看内存、调试位掩码时特别有用。"
],
code:`#include <stdio.h>

int main(void)
{
    int a = 255;
    printf("%d %o %x %X\\n", a, a, a, a);

    // 三种进制字面量
    int b = 0b1010;   // 二进制 10
    int c = 0755;     // 八进制 493
    int d = 0xFF;     // 十六进制 255
    printf("%d %d %d\\n", b, c, d);

    // 负数在内存里是补码
    signed char m = -1;
    printf("%d %#x\\n", m, (unsigned char)m);   // -1 → 0xff
    return 0;
}`,
out:`255 377 ff FF
10 493 255
-1 0xff`,
tips:["八进制字面量是 0 开头，不是字母 o。写 010 是 8，不是 10，新手最容易在这里栽。",
"%x 打印的是无符号十六进制，传负数会得到补码形式，这正是我们想看的。"]},

{t:"04 数据类型总览：一张表看懂该用哪个",
d:"int 存整数、double 存小数、char 存字符——但 char 本质是 1 字节整数，字符串根本不是一种类型。",
body:[
"p:C 的类型系统不复杂，但坑很多。先记住四大家族：整数、浮点、字符、派生（数组/指针/结构体）。",
"h:常用类型与取值",
"ul:char 1 字节，-128~127 或 0~255（取决于是否 signed）|short 通常 2 字节|int 通常 4 字节，-21 亿 ~ 21 亿|long 在 Windows 64 位是 4 字节，在 Linux 64 位是 8 字节 —— 跨平台不一致，别依赖|long long 8 字节，C99 起标准|float 4 字节，约 6~7 位有效数字|double 8 字节，约 15~16 位有效数字",
"p:sizeof 是**运算符**不是函数，它在编译期就能算出结果，所以 sizeof(int) 不会真的去「调用」什么。用它来确定类型大小，比背表靠谱。",
"h:怎么选",
"ul:默认整数就用 int，不够大用 long long|小数默认用 double，float 只在内存紧张（嵌入式、大量数组）时用|存字符用 char，存字符串用 char 数组|布尔用 int 或 stdbool.h 里的 bool",
"warn:long 的大小随平台变，凡是需要固定 8 字节的场合，用 stdint.h 里的 int64_t / uint32_t 这类定长类型。",
"note:整数类型还可以加 unsigned 修饰，表示「不要符号位」，取值范围翻倍但只表示非负数。循环变量、数组下标用 int 就够了，用 unsigned 反而容易在倒序循环时踩坑（i >= 0 永远成立）。"
],
code:`#include <stdio.h>

int main(void)
{
    printf("char      %zu 字节\\n", sizeof(char));
    printf("short     %zu 字节\\n", sizeof(short));
    printf("int       %zu 字节\\n", sizeof(int));
    printf("long      %zu 字节\\n", sizeof(long));
    printf("long long %zu 字节\\n", sizeof(long long));
    printf("float     %zu 字节\\n", sizeof(float));
    printf("double    %zu 字节\\n", sizeof(double));
    printf("指针      %zu 字节\\n", sizeof(void *));
    return 0;
}`,
out:`char      1 字节
short     2 字节
int       4 字节
long      8 字节      ← Windows 上是 4，Linux/macOS 64 位是 8
long long 8 字节
float     4 字节
double    8 字节
指针      8 字节`,
tips:["sizeof 的格式符是 %zu（size_t 类型），用 %d 在部分平台会警告。",
"指针大小和类型无关，只和平台位数有关：64 位系统上任何指针都是 8 字节。"]},

{t:"05 标识符、关键字、注释：命名这件小事",
d:"名字起不好，三个月后自己都看不懂。规则只有三条，但「见名知意」是另一回事。",
body:[
"p:**标识符**就是你给变量、函数、结构体起的名字。规则很死：只能由字母、数字、下划线组成，不能以数字开头，不能是关键字，区分大小写。",
"h:C 的关键字（C99 共 37 个）",
"p:常用的：int char float double void short long signed unsigned const volatile static extern auto register if else switch case default for while do break continue return sizeof struct union enum typedef goto inline restrict _Bool。",
"p:注意 sizeof 是关键字不是函数；main 不是关键字，只是约定俗成的入口名；define/include 是预处理指令，也不是关键字。",
"h:命名风格",
"ul:变量和函数用 snake_case 或 camelCase，全项目统一一种|常量宏用全大写 MAX_SIZE|别用 l（小写 L）、O（大写 o）、I 当变量名，肉眼分不清 1 和 0|名字要有信息量：用 timeout_ms 而不是 t",
"h:注释有两种",
"ul:// 单行注释，C99 起标准支持|/* ... */ 块注释，可跨行，但不能嵌套",
"note:注释是写「为什么」，不是写「是什么」。i++; // i 加一 这种注释等于没写；写成 // 跳过已处理的行，避免重复计数 才有价值。"
],
code:`// 单行注释：从 // 到这一行结束
/* 块注释：可以跨行。
   注意块注释不能嵌套：内层再写一次「斜杠加星号」，
   外层会在那里提前结束，剩下的文字全变成代码。 */
#include <stdio.h>

#define MAX_SIZE 100        // 宏名全大写

int max_score = 0;          // 全局变量：加前缀区分

int main(void)
{
    int student_count = 3;  // 局部变量：小写下划线
    // 累加所有及格分数
    for (int i = 0; i < student_count; i++) {
        max_score += 60;
    }
    printf("%d\\n", max_score);
    return 0;
}`,
out:`180`,
tips:["变量名不能和关键字重名：int int = 0; 会直接编译失败。",
"标准库函数名（printf、malloc、index、time）别拿来当自己的变量名，轻则警告重则行为诡异。",
"注释里写中文没问题，但源文件编码要统一 UTF-8，否则换个编辑器就乱码。"]},

{t:"06 常量、字面量与转义字符",
d:"1 是 int，1.0 是 double，'1' 是字符，\"1\" 是字符串——长得像，类型完全不同。",
body:[
"p:**字面量**是代码里直接写死的值，它本身就有类型，这个类型决定了运算怎么做。整数除法 1/2 = 0，就是因为两边都是 int。",
"h:字面量的类型规则",
"ul:1 → int；1L → long；1LL → long long；1U → unsigned|1.0 → double；1.0f → float；1e3 → double 的 1000.0|'A' → char，值是 65|\\\"A\\\" → 字符串，占 2 字节（'A' 加结束符 \\0）",
"h:定义常量的两种方式",
"ul:#define PI 3.14159 —— 预处理阶段纯文本替换，没有类型，不占变量空间|const double PI = 3.14159; —— 有类型、有作用域、编译器能检查，现代 C 更推荐",
"h:转义字符",
"ul:\\n 换行 \\t 制表 \\\\ 反斜杠 \\' 单引号 \\\" 双引号 \\0 空字符（字符串结束标志）|\\r 回车（Windows 换行是 \\r\\n）|\\a 响铃 \\b 退格|\\x41 十六进制 0x41 即 'A'|\\101 八进制 101 即 'A'",
"note:\\0 是字符串的结束符，值为 0，printf 遇到它就停。这个「以 0 结尾」的约定是 C 字符串一切行为的根源。"
],
code:`#include <stdio.h>

#define MAX_LEN 20
const double PI = 3.14159;

int main(void)
{
    printf("%zu %zu\\n", sizeof(1), sizeof(1.0));       // 4 8
    printf("%zu %zu\\n", sizeof('A'), sizeof("A"));     // 4 2（C 里字符常量是 int）
    printf("%d %d\\n", 1 / 2, (int)(1.0 / 2));           // 0 0
    printf("%f\\n", 1.0 / 2);                           // 0.500000
    printf("[%c][%c][%c]\\n", '\\x41', '\\101', 65);        // 都是 A
    printf("tab\\there\\n");
    return 0;
}`,
out:`4 8
4 2
0 0
0.500000
[A][A][A]
tab	here`,
tips:["sizeof('A') 在 C 里是 4（字符常量是 int），在 C++ 里是 1 —— 两个语言在这里不一致，别记混。",
"想算小数除法，两边至少有一个是浮点：写成 1.0/2 或 (double)1/2。"]},

/* ================= 第 2 章 变量与运算 ================= */
{c:"🔢 第 2 章 变量、类型与运算",
t:"07 整型家族：取值范围、溢出与无符号陷阱",
d:"int 存不下 21 亿以上，超了不会报错，只会悄悄绕回负数。这是最隐蔽的一类 bug。",
body:[
"p:整型不是「一个类型」，而是一族：char / short / int / long / long long，每个都能加 signed 或 unsigned。取值范围由字节数决定：n 位有符号整数是 -2^(n-1) ~ 2^(n-1)-1。",
"h:溢出是怎么发生的",
"p:整数在内存里是定长的，超出范围的高位会被**直接丢掉**（不是报错）。int 的 2147483647 加 1，得到 -2147483648。这叫**有符号溢出**，标准上说这是未定义行为（UB），实际编译器可能做出任何事，包括把整个 if 优化掉。",
"p:无符号溢出是**定义良好**的：按 2^n 取模回绕。所以 0u - 1 一定等于 4294967295。",
"h:无符号的三个经典坑",
"ul:倒序循环 for (unsigned i = n; i >= 0; i--) 死循环，因为 i 永远 >= 0|if (a - b > 0) 在 a、b 都是 unsigned 且 a < b 时会判成真|printf(\"%d\") 打无符号大数会变负数，应该用 %u",
"warn:int 的溢出是未定义行为，不是「回绕成负数」这么简单——开 -O2 优化后编译器可能直接假设它不会溢出，导致逻辑整个跑偏。要检测溢出，用 __builtin_add_overflow 或先转 long long 再算。",
"note:做题/刷题时，如果答案可能超过 21 亿，直接把变量声明成 long long，别等 WA 了再找。"
],
code:`#include <stdio.h>
#include <limits.h>

int main(void)
{
    printf("int 范围: %d ~ %d\\n", INT_MIN, INT_MAX);
    printf("unsigned int 范围: 0 ~ %u\\n", UINT_MAX);

    int big = INT_MAX;
    printf("INT_MAX + 1 = %d\\n", big + 1);      // 溢出，未定义行为

    unsigned u = 0;
    printf("0u - 1 = %u\\n", u - 1);             // 4294967295，按模回绕

    // 正确的溢出检测思路：先扩大再运算
    long long safe = (long long)INT_MAX + 1;
    printf("安全计算: %lld\\n", safe);
    return 0;
}`,
out:`int 范围: -2147483648 ~ 2147483647
unsigned int 范围: 0 ~ 4294967295
INT_MAX + 1 = -2147483648
0u - 1 = 4294967295
安全计算: 2147483648`,
tips:["limits.h 里有 INT_MAX / INT_MIN / UINT_MAX，别硬编码这些数字。",
"数组下标、循环计数用 int，别用 unsigned，能避开一大半倒序循环的坑。"]},

{t:"08 浮点数：0.1 + 0.2 为什么不等于 0.3",
d:"float/double 用二进制存小数，很多十进制小数根本存不下，只能存一个最近似的值。这不是 C 的 bug，是所有 IEEE 754 实现的共性。",
body:[
"p:十进制里 1/3 = 0.333... 写不完；二进制里 0.1 = 0.0001100110011... 也写不完。double 只有 52 位尾数，超出的部分被截断，于是 0.1 存进去就已经不是精确的 0.1 了。",
"h:由此推出的三条铁律",
"ul:永远不要用 == 比较两个浮点数|判断「等于 0」要写成 fabs(x) < 1e-9|累加很多次小数时误差会积累，金额计算要么用整数分，要么用定点数",
"p:比较的正确写法是看差值是否小于一个容差（epsilon）：",
"code:if (fabs(a - b) < 1e-9) { /* 视为相等 */ }",
"h:float 与 double 的差别",
"ul:float：4 字节，6~7 位有效数字，适合大量数据、GPU|double：8 字节，15~16 位有效数字，默认选择|printf 打印 float 会自动提升为 double，所以用 %f 就行；scanf 读 float 必须用 %f，读 double 必须用 %lf",
"warn:scanf 里把 %lf 写成 %f 给 double 用，会直接写坏内存——因为 double 是 8 字节，float 只写 4 字节，剩下 4 字节是垃圾。这类错误编译器不一定报。",
"note:printf 输出 %f 默认 6 位小数；%.2f 保留两位；%e 科学计数法；%g 自动选择更短的形式。"
],
code:`#include <stdio.h>
#include <math.h>

int main(void)
{
    double a = 0.1, b = 0.2;
    printf("%.17f\\n", a + b);
    printf("a + b == 0.3 ? %d\\n", a + b == 0.3);        // 0，不相等

    if (fabs((a + b) - 0.3) < 1e-9)
        printf("按容差判断：相等\\n");

    printf("%.2f | %e | %g\\n", 3.14159, 31415.9, 0.0001);

    float f = 1.0f / 3;
    printf("%.10f\\n", f);                              // 精度明显低于 double
    return 0;
}`,
out:`0.30000000000000004
a + b == 0.3 ? 0
按容差判断：相等
3.14 | 3.141590e+04 | 0.0001
0.3333333433`,
tips:["编译时链接数学库：gcc x.c -lm（Linux 上 fabs 需要）。",
"金额计算别用 double，用「分」为单位的 int/long long，或者自己实现定点数。"]},

{t:"09 char 与 ASCII：字符其实就是小整数",
d:"char 是 1 字节整数，'A' 就是 65。理解这一点，大小写转换、字符判断全都能用算术解决。",
body:[
"p:C 没有「字符类型」这一说，char 就是一个 1 字节的整数类型，只是我们约定用它的值来表示字符编码。'A' 和 65 在内存里完全一样。",
"h:必须记住的 ASCII 区间",
"ul:'0'~'9' = 48~57|'A'~'Z' = 65~90|'a'~'z' = 97~122|大写和小写相差 32（第 6 位是 0 还是 1）|空格 = 32，'\\n' = 10，'\\0' = 0",
"p:所以大小写转换可以写成 c - 32 / c + 32，或者更优雅地用位运算 c & ~32（转大写）、c | 32（转小写）。",
"h:数字字符转数值",
"ul:'7' - '0' = 7 —— 这是解析数字的标准手法|反过来 7 + '0' = '7'",
"h:signed char 还是 unsigned char",
"ul:char 是否有符号由实现决定，移植时别假设|要按字节处理二进制数据（图片、网络包），用 unsigned char，避免出现负数|超过 127 的值当负数打印，是新手最常见的困惑",
"note:ctype.h 提供现成判断：isdigit、isalpha、isupper、tolower、toupper。自己写也行，但库函数更快更安全（它们处理了负数和 EOF）。"
],
code:`#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char c = 'a';
    printf("%c = %d\\n", c, c);                 // a = 97
    printf("%c\\n", c - 32);                     // A，小写转大写
    printf("%c\\n", 'B' | 32);                   // b，位运算转小写

    char digit = '7';
    int n = digit - '0';                        // 字符转数值
    printf("%d + 1 = %d\\n", n, n + 1);

    // 统计一串字符里的字母、数字、其他
    const char *s = "C99 is fun!";
    int alpha = 0, num = 0, other = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (isalpha((unsigned char)s[i])) alpha++;
        else if (isdigit((unsigned char)s[i])) num++;
        else other++;
    }
    printf("字母 %d 数字 %d 其他 %d\\n", alpha, num, other);
    return 0;
}`,
out:`a = 97
A
b
7 + 1 = 8
字母 5 数字 2 其他 4`,
tips:["给 isalpha 这类函数传 char 时先转 unsigned char，否则遇到高位字节（如中文）可能越界访问。",
"char 只有 1 字节，存不下汉字（UTF-8 一个汉字 3 字节），要存中文用 char 数组或 wchar_t。"]},

{t:"10 类型转换：隐式提升与强制转换",
d:"int + double 结果是什么？char 参与运算会变成什么？隐式转换规则不清楚，就会写出「看似对、其实精度已经丢了」的代码。",
body:[
"p:当不同类型一起运算时，C 会自动做**隐式类型转换**，方向是「往精度更高、范围更大的类型走」。规则可以记成一条「转换阶梯」：",
"ul:char / short → int（整型提升，几乎所有运算前都会先做这一步）|int → unsigned → long → long long → float → double → long double",
"p:所以 3 + 4.0 的结果是 double；sizeof('a' + 'b') 是 4，因为两个 char 先提升成 int 再相加。",
"h:赋值时的隐式转换：从宽到窄会静默丢数据",
"ul:int 赋给 char，只保留最低 1 字节|double 赋给 int，小数部分直接截断（不是四舍五入）|负数赋给 unsigned，按补码重新解释成一个大正数",
"h:强制转换（显式）",
"p:写法是 (目标类型)表达式。它的作用只是「告诉编译器我知道自己在干什么」，不改变内存里的位，只是换一种解释方式。",
"code:(double)1 / 2     // 0.5，先转再除\n(double)(1 / 2)   // 0.0，先除（整除得 0）再转",
"warn:括号位置决定结果，这是考试和实战都爱考的点。想转谁就把括号套在谁身上。",
"note:浮点转整数是截断不是四舍五入：int x = 3.99 → 3。要四舍五入用 round() 或 (int)(x + 0.5)（仅对正数成立）。"
],
code:`#include <stdio.h>

int main(void)
{
    printf("%f\\n", 3 + 4.0);              // int 提升为 double
    printf("%zu\\n", sizeof('a' + 'b'));    // 4：两个 char 提升为 int

    int i = 3.99;
    printf("%d\\n", i);                     // 3，截断

    char c = 300;                          // 只留低 8 位
    printf("%d\\n", c);                     // 44

    unsigned u = -1;
    printf("%u\\n", u);                     // 4294967295

    printf("%f %f\\n", (double)1 / 2, (double)(1 / 2));
    return 0;
}`,
out:`7.000000
4
3
44
4294967295
0.500000 0.000000`,
tips:["-Wconversion 能让编译器提示有损转换，写数值敏感的代码时建议打开。",
"面试常问：char c = 300 是多少？答案是 300 % 256 = 44（实现相关，但绝大多数平台如此）。"]},

{t:"11 算术运算符：整除、取模与「负数取模」",
d:"5/2=2 不是 bug，是整数除法。取模 % 只对整数有意义，而且负数取模的结果在不同语言里不一样。",
body:[
"p:C 的算术运算符：+ - * / %，外加 ++ -- 和复合赋值 += -= *= /= %=。规则不复杂，但有两个必须刻在脑子里的点。",
"h:要点一：整数除法向零截断",
"ul:5 / 2 = 2，-5 / 2 = -2（不是 -3，向零截断）|只要有一个操作数是浮点，就是浮点除法：5 / 2.0 = 2.5|除数为 0：整数除零是未定义行为（通常直接崩），浮点除零得到 inf 或 nan",
"h:要点二：% 只能用于整数",
"p:5 % 2 = 1，5 % -2 = 1（C99 规定符号跟随被除数）。想对浮点取余要用 fmod()。",
"h:% 的三个高频用途",
"ul:判断奇偶：n % 2 == 0|循环取模做环形缓冲：index = (index + 1) % N|取数字的每一位：n % 10 取个位，n / 10 去掉个位",
"h:复合赋值更高效也更易错",
"p:a += b 等价于 a = a + b，但 a 只求值一次。x *= y + 1 等于 x = x * (y + 1)，因为赋值运算符优先级最低——这点常常被误解成 x = x * y + 1。",
"note:自增自减单独成句没问题，混在表达式里就是给自己找麻烦：printf(\"%d %d\", i++, i++) 的输出顺序在标准里是未指定的，不同编译器结果不同。"
],
code:`#include <stdio.h>

int main(void)
{
    printf("%d %d %d\\n", 5 / 2, -5 / 2, 5 / 2.0 == 2.5);
    printf("%d %d\\n", 5 % 2, -5 % 2);
    printf("%.2f\\n", 5.0 / 2);

    // 取每一位：1234 → 4 3 2 1
    int n = 1234;
    while (n > 0) {
        printf("%d ", n % 10);
        n /= 10;
    }
    printf("\\n");

    // 环形下标
    int idx = 0;
    for (int i = 0; i < 5; i++) {
        idx = (idx + 1) % 3;
        printf("%d ", idx);      // 1 2 0 1 2
    }
    printf("\\n");
    return 0;
}`,
out:`2 -2 1
1 1
2.50
4 3 2 1 
1 2 0 1 2`,
tips:["x % 2 == 1 判断奇偶对负数不成立（-3 % 2 = -1），用 x % 2 != 0 更稳。",
"除以 0 一定要在代码里挡住，尤其是用户输入做分母的情况。"]},

{t:"12 自增自减：i++ 与 ++i 到底差在哪",
d:"都能让 i 加 1，区别在于表达式的值是「加之前」还是「加之后」。单独成句时两者完全等价，混进表达式才有区别。",
body:[
"p:++i 叫**前置自增**：先加 1，表达式的值是新值。i++ 叫**后置自增**：表达式的值是旧值，然后 i 再加 1。",
"h:看一个例子就明白",
"code:int i = 5;\nint a = i++;   // a = 5, i = 6\nint b = ++i;   // b = 7, i = 7",
"p:实现层面，后置版本需要先保存一份旧值（临时对象），前置版本直接改完返回引用。对 int 这种内建类型，编译器会优化掉差别；对迭代器这类自定义类型，++it 通常比 it++ 快，所以 C++ 圈的习惯是优先写前置。",
"h:三条实战建议",
"ul:循环里写 i++ 或 ++i 都行，选一种风格统一就好|不要在同一个表达式里对同一变量多次自增：i = i++ + ++i 是未定义行为，C 标准明确规定这种写法没有意义|指针也支持 ++：p++ 表示指向下一个元素，不是地址加 1 字节",
"code:int a[3] = {10, 20, 30};\nint *p = a;\nprintf(\"%d\", *p++);   // 输出 10，然后 p 指向 a[1]\nprintf(\"%d\", *++p);   // p 先移到 a[2]，输出 30",
"warn:*p++ 和 (*p)++ 完全不同：前者是「取当前值，指针后移」，后者是「把指针指向的值加一」。这两个写法在字符串遍历、数组拷贝里到处都是，必须分清。",
"note:自减同理：--i 前置，i-- 后置。"
],
code:`#include <stdio.h>

int main(void)
{
    int i = 5;
    printf("i++ 的值 %d，之后 i = %d\\n", i++, i);   // 5, 6

    i = 5;
    printf("++i 的值 %d，之后 i = %d\\n", ++i, i);   // 6, 6

    int a[3] = {10, 20, 30};
    int *p = a;
    printf("%d ", *p++);     // 10，p 移到 a[1]
    printf("%d ", *p);       // 20
    printf("%d\\n", ++*p);   // 21：先取 *p 再加一

    int x = 5;
    printf("%d\\n", x++ + ++x);   // 不要在生产代码里这么写！
    return 0;
}`,
out:`i++ 的值 5，之后 i = 6
++i 的值 6，之后 i = 6
10 20 21
12`,
tips:["最后一行 x++ + ++x 在不同编译器上可能得到 11 或 12，属于未定义行为，只适合用来理解「为什么不能这么写」。",
"printf 的参数求值顺序未指定，所以 printf(\"%d %d\", i++, i++) 的结果不可依赖。"]},

{t:"13 运算符优先级与结合性",
d:"不用背全表，记住「括号最优先」和几个高频陷阱就够了：位运算比比较低、赋值最低、&& 比 || 高。",
body:[
"p:优先级决定「先算谁」，结合性决定「同级从左还是从右算」。全表 15 级没人背得下来，实用的做法是记住下面几条，其余一律加括号。",
"h:从高到低的关键几级",
"ul:() [] -> . （最高）|! ~ ++ -- + - (类型) * & sizeof （单目）|* / % （乘除取余）|+ - （加减）|<< >> （移位）|< <= > >= （比较）|== != （相等）|& （按位与）|^ （按位异或）|\\| （按位或）|&& （逻辑与）|\\|\\| （逻辑或）|?: （三目）|= += -= 等（赋值，右结合）|, （逗号，最低）",
"h:四个经典陷阱",
"ul:if (a & 1 == 0) 实际是 a & (1 == 0)，因为 == 优先级高于 &|flag = a > b ? a : b + 1 实际是 b + 1 参与比较|*p++ 是 *(p++)，不是 (*p)++|a = b = c 因为赋值右结合，等价于 a = (b = c)，这是合法的连续赋值",
"p:还有个高频点：**位运算的优先级低于比较运算**，这跟直觉相反。所以判断某一位是否为 1，必须写 if ((x & mask) != 0)，括号不能省。",
"note:记不住就加括号。多打两个括号的成本，远低于查一个优先级 bug 的成本。"
],
code:`#include <stdio.h>

int main(void)
{
    int a = 5, b = 3, c = 2;

    printf("%d\\n", a + b * c);        // 11，先乘后加
    printf("%d\\n", (a + b) * c);      // 16

    int x = 4;
    printf("%d\\n", x & 1 == 0);       // 4 & (1==0) → 4 & 0 → 0（陷阱！）
    printf("%d\\n", (x & 1) == 0);     // 1，正确写法

    int m = 5;
    int r = m > 3 ? 100 : 200 + 1;     // 200+1 先算，但仍取 100
    printf("%d\\n", r);

    int p, q;
    p = q = 7;                          // 右结合
    printf("%d %d\\n", p, q);
    return 0;
}`,
out:`11
16
0
1
100
7 7`,
tips:["-Wparentheses 能提示大部分优先级歧义，建议常开。",
"三目运算符 ?: 的优先级低于大多数运算符，写复杂表达式时给整个三目加括号最稳。"]},

{t:"14 关系、逻辑运算与短路求值",
d:"&& 和 || 会「短路」：左边能定结果就不算右边。这个特性既能救你（防止空指针），也能坑你（副作用没执行）。",
body:[
"p:关系运算符有 < <= > >= == !=，结果是 int 的 0 或 1（C 没有真正的 bool，C99 的 _Bool 也只是一层包装）。逻辑运算符有三个：&& || !。",
"h:短路求值规则",
"ul:a && b：a 为假，直接返回 0，**b 不执行**|a \\|\\| b：a 为真，直接返回 1，**b 不执行**|!a：真假取反",
"p:短路最常见的正确用法是「先判空再解引用」：",
"code:if (p != NULL && p->value > 0) { ... }   // p 为空时后面不会执行，安全\nif (count == 0 || sum / count > 10) { ... } // 避免除零",
"h:副作用陷阱",
"p:如果右边有副作用（自增、函数调用、赋值），短路会让它不执行：",
"code:int i = 0;\nif (0 && i++) { }    // i 仍然是 0，i++ 根本没跑",
"h:真假的判定",
"p:C 里**非 0 即真**，0 为假。所以 if (1)、if (-1)、if (0.5) 都是真；if (0.0001) 也是真——浮点判空要显式比较。反过来，if (x = 0) 是**赋值**，表达式的值是 0，条件永远为假，而且 x 被改成了 0，这是 C 语言最著名的低级 bug。",
"note:防御性写法：把常量写在左边 if (0 == x)，一旦写成 = 就会编译报错（不能给常量赋值）。这就是所谓的 Yoda 条件。"
],
code:`#include <stdio.h>

int main(void)
{
    int a = 5;

    printf("%d %d\\n", a > 3, a == 4);        // 1 0

    // 短路：左边为假，右边不执行
    int i = 0;
    if (0 && i++) { }
    printf("i = %d\\n", i);                   // 0

    // 短路防除零
    int count = 0, sum = 100;
    if (count == 0 || sum / count > 10)
        printf("不走除法，安全\\n");

    // 非 0 即真
    if (-1) printf("-1 是真\\n");
    if (!0.0) printf("0.0 是假\\n");

    // 经典错误：= 与 ==
    int x = 3;
    if (x = 0) printf("永远不会打印\\n");
    printf("x 被改成了 %d\\n", x);
    return 0;
}`,
out:`1 0
i = 0
不走除法，安全
-1 是真
0.0 是假
x 被改成了 0`,
tips:["开 -Wall 后，if (x = 0) 会给出 warning: suggest parentheses around assignment —— 看到这条警告就该警觉。",
"逻辑与/或是短路求值，按位与/或（& |）不是，两者别混用。"]}
]);

/* C 语言笔记 · 第 3~5 章：输入输出 / 流程控制 / 数组 */
window.C_NOTES = (window.C_NOTES || []).concat([

/* ================= 第 3 章 输入输出 ================= */
{c:"⌨️ 第 3 章 输入输出与缓冲区",
t:"15 printf：格式符、宽度、精度与对齐",
d:"printf 不只是 %d 和 %f。宽度、精度、左对齐、补零这些能力，能让你不写一行排版代码就打出整齐的表格。",
body:[
"p:printf 的原型是 int printf(const char *format, ...)，返回**实际输出的字符数**。第一个参数是格式串，后面的参数按格式串里的 % 依次匹配。",
"h:常用格式符全表",
"ul:%d / %i 有符号整数|%u 无符号整数|%ld %lld 长整型|%f 浮点（默认 6 位小数）|%.2f 保留两位|%e 科学计数法|%g 自动选短的形式|%c 单字符|%s 字符串|%p 指针地址（十六进制带 0x）|%x / %X 十六进制|%o 八进制|%% 输出百分号本身|%zu size_t（sizeof 的返回类型）",
"h:宽度、精度、对齐",
"p:在 % 和格式符之间可以插入修饰：%[标志][宽度][.精度]类型。",
"ul:%8d 右对齐，总宽 8 格，不够补空格|%-8d 左对齐|%08d 补零|%8.3f 总宽 8，小数 3 位|%.5s 只输出字符串前 5 个字符|%+d 强制显示正负号",
"h:一个坑",
"p:格式符和参数类型不匹配，是最危险的错误之一。用 %d 打 double 会读到错误的字节（double 是 8 字节，%d 只读 4 字节），轻则乱码重则崩溃。现代编译器会给出 -Wformat 警告，务必重视。",
"note:想打 64 位整数用 %lld（Windows 上是 %I64d，但 %lld 在新版 MSVC 也支持）。跨平台代码用 inttypes.h 的 PRId64 宏最稳。"
],
code:`#include <stdio.h>

int main(void)
{
    printf("%d|%5d|%-5d|%05d\\n", 42, 42, 42, 42);
    printf("%.2f|%8.3f|%-8.1f|\\n", 3.14159, 3.14159, 2.5);
    printf("%s|%10s|%-10s|%.3s\\n", "cat", "cat", "cat", "caterpillar");
    printf("%c %x %X %o %p\\n", 'A', 255, 255, 8, (void *)&main);
    printf("%% 百分号，%+d 带符号\\n", 7);

    // 用宽度打出表格
    const char *names[] = {"Li", "Zhang", "Wang"};
    int scores[] = {92, 78, 100};
    for (int i = 0; i < 3; i++)
        printf("%-8s %5d\\n", names[i], scores[i]);
    return 0;
}`,
out:`42|   42|42   |00042
3.14|   3.142|2.5     |
cat|       cat|cat       |cat
A ff FF 10 0x...
% 百分号，+7 带符号
Li          92
Zhang       78
Wang       100`,
tips:["printf 返回输出的字符数，可以用它做进度统计或检测输出失败（返回负数）。",
"%s 对应的是 char*，传 char 会当指针解释，直接崩溃。"]},

{t:"16 scanf：返回值、%s 越界与 & 的意义",
d:"scanf 是 C 里最容易出安全事故的函数。它默认不知道你的数组有多大，一个 %s 就能把内存写穿。",
body:[
"p:scanf 从标准输入按格式解析数据。它必须拿到变量的**地址**才能把结果写回去，所以基本类型前面都要加 &。数组名本身已经是地址，所以 char 数组不用加 &。",
"h:必须检查返回值",
"p:scanf 返回**成功匹配并赋值的项数**，失败返回 0，遇到输入结束或错误返回 EOF。不检查返回值，就会拿一个未被赋值的变量去做运算。",
"code:if (scanf(\"%d\", &n) != 1) { /* 输入不是整数，要处理 */ }",
"h:三个高危点",
"ul:%s 不检查长度，输入超过数组容量就溢出 —— 必须写 %19s 这种带宽度限制的形式（宽度 = 数组长度 - 1）|%c 会读入空格和换行，前面加一个空格 %c 可以跳过空白|%d 读不进去时会**把非法字符留在缓冲区**，导致后面的读取全部错位",
"h:读字符串的两条路",
"ul:scanf(\"%19s\", buf) —— 遇到空白就停，读不了带空格的句子|fgets(buf, sizeof buf, stdin) —— 读一整行（含空格），更安全，但会保留末尾的 \\n",
"note:缓冲区里残留的 \\n 是新手 90% 的「程序直接跳过输入」问题的根源。解决方法见下一篇。"
],
code:`#include <stdio.h>

int main(void)
{
    int n;
    printf("输入一个整数：");
    if (scanf("%d", &n) != 1) {
        printf("输入的不是整数\\n");
        return 1;
    }
    printf("读到 %d\\n", n);

    // 安全读字符串：宽度必须小于数组大小
    char name[20];
    printf("输入姓名：");
    scanf("%19s", name);
    printf("你好，%s\\n", name);

    // 读一整行（推荐）
    char line[100];
    int c;
    while ((c = getchar()) != '\\n' && c != EOF) { }   // 先清掉残留换行
    printf("输入一句话：");
    if (fgets(line, sizeof line, stdin))
        printf("你说：%s", line);
    return 0;
}`,
out:`输入一个整数：42
读到 42
输入姓名：Tom
你好，Tom
输入一句话：hello world
你说：hello world`,
tips:["%s 读入时如果输入超长，多出来的字符会留在缓冲区，破坏后续输入 —— 用宽度限制或 fgets。",
"数组名传参不要加 &：scanf(\"%s\", &buf) 类型是 char(*)[N]，虽然地址相同但类型不对，编译器会警告。"]},

{t:"17 输入缓冲区：为什么第二次输入被跳过了",
d:"scanf 读整数时，遇到字母就停下，把字母留在缓冲区里。下一次读取直接拿到这个字母，于是「跳过了」输入。",
body:[
"p:标准输入是**行缓冲**的：你敲的一整行先进入缓冲区，scanf 再从中按格式取数据。它只取走匹配的部分，剩下的（包括换行符）留在那里等下一次读。",
"h:典型故障现场",
"code:int n; char c;\nscanf(\"%d\", &n);   // 输入 \"12\\n\"，取走 12，留下 \\n\nscanf(\"%c\", &c);   // 立刻读到 \\n，看起来像「没等我输入」",
"h:三种解法",
"ul:在 %c 前加空格：scanf(\" %c\", &c)，空格会跳过所有空白字符（空格、制表、换行）|手动清空：while ((c = getchar()) != '\\n' && c != EOF) {}|整行读入再解析：fgets + sscanf，最稳",
"h:输入失败会「卡住」",
"p:如果 scanf(\"%d\") 遇到 \"abc\"，它一个字符都不消费，直接返回 0。如果代码在循环里不断重试，就会**死循环**——因为那个 a 永远留在缓冲区。所以循环读输入时必须检查返回值并清理非法字符。",
"note:这也是为什么工程代码更爱用 fgets 读整行，再用 sscanf/strtol 解析：一次把整行取干净，缓冲区永远是空的，不会有残留。"
],
code:`#include <stdio.h>

int main(void)
{
    int n;
    char c;

    printf("输入数字：");
    scanf("%d", &n);          // 缓冲区里留下 '\\n'

    printf("输入字符（会直接读到换行）：");
    scanf("%c", &c);
    printf("读到的是 %d（10 就是换行）\\n", c);

    // 正确做法：格式串前加空格跳过空白
    printf("再输入一个字符：");
    scanf(" %c", &c);
    printf("这次读到 %c\\n", c);

    // 循环读输入时必须清缓冲，否则非法字符会让死循环
    int x, ch;
    while (1) {
        printf("输入一个数（输入 q 退出）：");
        if (scanf("%d", &x) == 1) break;
        ch = getchar();                       // 先取走那个坏字符
        if (ch == 'q' || ch == EOF) return 0; // EOF 也要能退出
        while (ch != '\\n' && ch != EOF) ch = getchar();  // 清掉本行剩余
        printf("不是合法整数，重来\\n");
    }
    printf("你输入了 %d\\n", x);
    return 0;
}`,
out:`输入数字：12
输入字符（会直接读到换行）：读到的是 10（10 就是换行）
再输入一个字符：a
这次读到 a`,
tips:["记住一个口诀：%c 和 %[ 前面加空格，%d/%f/%s 会自动跳过空白。",
"混用 scanf 和 getchar/fgets 时，务必先清缓冲区。",
"清缓冲的循环一定要同时判 EOF：输入被重定向或用户按 Ctrl+Z/Ctrl+D 后，getchar() 永远返回 -1，while (getchar() != '\\n') 就成了死循环 —— 这是新手代码卡死的头号原因。"]},

{t:"18 getchar / putchar：逐字符处理的基础",
d:"getchar 一次读一个字符，返回 int 而不是 char —— 因为要用 -1（EOF）表示「读完了」。",
body:[
"p:getchar() 从标准输入读一个字符并返回它的 int 值；putchar(c) 输出一个字符。为什么不返回 char？因为要能区分「读到的字节正好是 0xFF」和「文件结束」。char 只有 256 种取值，装不下 257 种状态。",
"h:标准读取循环",
"code:int c;\nwhile ((c = getchar()) != EOF) {\n    putchar(c);\n}",
"p:这个循环是「逐字符拷贝」的骨架，统计行数、单词数、字符数，大小写转换，去掉多余空格，全靠它变形。注意 c 必须声明成 int，写成 char c 在部分平台上永远等不到 EOF，会死循环。",
"h:常见变形",
"ul:统计行数：读到 \\n 就加一|统计单词数：从空白进入非空白时加一|大小写转换：putchar(toupper(c))|数字求和：遇到 '0'~'9' 就累加 c - '0'",
"h:EOF 怎么输入",
"p:终端里 Windows 按 Ctrl+Z 再回车，Linux/macOS 按 Ctrl+D，表示输入结束。程序里判断的是「返回值为 EOF」，不是读到某个特殊字符。",
"note:putchar 返回值是写入的字符，出错返回 EOF。批量输出时用 putchar 通常比 printf 快，因为它没有格式解析开销。"
],
code:`#include <stdio.h>
#include <ctype.h>

int main(void)
{
    // 统计字符数、行数、单词数（Linux 的 wc 简化版）
    int c, chars = 0, lines = 0, words = 0, in_word = 0;

    while ((c = getchar()) != EOF) {
        chars++;
        if (c == '\\n') lines++;
        if (isspace(c)) {
            in_word = 0;
        } else if (!in_word) {
            in_word = 1;
            words++;
        }
    }
    printf("字符 %d 行 %d 单词 %d\\n", chars, lines, words);
    return 0;
}`,
out:`$ echo "hello c world" | ./a.out
字符 14 行 1 单词 3`,
tips:["c 一定要用 int，用 char 存 getchar 的返回值在 ARM 等平台会死循环。",
"读文件时同理：fgetc 返回 int，判断 feof 不如直接判断返回值是否为 EOF。"]},

{t:"19 输入输出小结：什么场景用哪个函数",
d:"printf / scanf / gets / fgets / getchar / sscanf —— 六个函数按场景对号入座，别只会前两个。",
body:[
"h:输出",
"ul:printf 格式化输出，最常用|puts(s) 输出字符串并自动加换行，比 printf(\"%s\\n\") 快|putchar(c) 输出单字符|fprintf(fp, ...) 输出到文件|sprintf(buf, ...) 输出到字符串（危险，用 snprintf 更安全）",
"h:输入",
"ul:scanf 按格式解析，适合结构化数据（数字、单词）|fgets(buf, n, stdin) 读一整行，安全，推荐|getchar 逐字符读|sscanf(str, fmt, ...) 从字符串里解析，配合 fgets 是黄金组合|gets 已被 C11 删除，永远不要用",
"h:推荐组合",
"p:交互式程序最稳的模式是：**fgets 读整行 → 去掉结尾换行 → sscanf 解析**。这样缓冲区永远是干净的，不会出现「跳过输入」「死循环」这些幺蛾子。",
"code:char line[128];\nif (fgets(line, sizeof line, stdin)) {\n    line[strcspn(line, \"\\n\")] = 0;   // 去掉换行\n    int a, b;\n    if (sscanf(line, \"%d %d\", &a, &b) == 2) {\n        printf(\"%d\\n\", a + b);\n    }\n}",
"note:strcspn(line, \"\\n\") 返回 \\n 之前的长度，直接把它置 0 就是「删掉换行」的标准写法，比 strtok 安全，也比手写循环短。"
],
code:`#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[128];

    printf("输入两个整数（如 3 4）：");
    if (!fgets(line, sizeof line, stdin)) return 0;   // 没有输入就直接结束，不算出错

    line[strcspn(line, "\\n")] = '\\0';   // 去掉换行

    int a, b;
    if (sscanf(line, "%d %d", &a, &b) == 2)
        printf("%d + %d = %d\\n", a, b, a + b);
    else
        printf("格式不对\\n");

    // 输出到字符串
    char buf[64];
    snprintf(buf, sizeof buf, "结果是 %d", a + b);
    puts(buf);                            // puts 自动换行
    return 0;
}`,
out:`输入两个整数（如 3 4）：3 4
3 + 4 = 7
结果是 7`,
tips:["sprintf 不检查目标大小，能用 snprintf 就别用 sprintf。",
"puts 会自动加换行，如果字符串本身带 \\n 就会空一行。"]},

/* ================= 第 4 章 流程控制 ================= */
{c:"🔀 第 4 章 流程控制",
t:"20 if / else：C 的决策结构",
d:"if 后面跟的是一个「表达式」，非 0 就执行。真正难的从来不是语法，而是条件的边界写没写对。",
body:[
"p:三种基本结构——顺序、选择、循环——是所有程序的骨架。if 是选择结构的核心，语法有三种形态：",
"code:if (条件) 语句;\nif (条件) 语句1; else 语句2;\nif (条件1) 语句1; else if (条件2) 语句2; else 语句3;",
"h:三个必须注意的点",
"ul:条件用**表达式**而不是「布尔值」，非 0 即真，所以 if (p) 就是判空指针|else 永远和**最近的、未配对的 if** 配对，这叫悬空 else|if (x = 0) 是赋值不是比较，值恒为 0，条件永远假",
"h:边界条件怎么写对",
"p:写多分支时，让条件的边界「首尾相接、不重不漏」：分数段用 >= 90、>= 60、else，从高到低一路比下来，每个分数只落进一个分支。反过来从低到高写，就容易出现 60<=x<70 和 70<=x<80 之间漏掉 70 这类错误。",
"h:嵌套太深怎么办",
"p:超过三层的 if 嵌套就该重构了。两个常用技巧：**提前返回**（不满足条件就 return，把主逻辑拉平）和**条件合并**（用 && 把能合并的条件并到一起）。",
"note:每个分支都加花括号，即使只有一行。这样以后加代码不会漏括号，也能避免「多打一个分号导致空语句」这类诡异 bug。"
],
code:`#include <stdio.h>

int main(void)
{
    int score;
    printf("输入分数：");
    if (scanf("%d", &score) != 1) return 0;   // 没有输入就直接结束

    if (score < 0 || score > 100) {
        printf("分数不合法\\n");
    } else if (score >= 90) {
        printf("优秀\\n");
    } else if (score >= 80) {
        printf("良好\\n");
    } else if (score >= 60) {
        printf("及格\\n");
    } else {
        printf("不及格\\n");
    }

    // 提前返回：把嵌套拉平
    int year = 2024;
    if (year % 400 != 0 && (year % 4 != 0 || year % 100 == 0)) {
        printf("不是闰年\\n");
        return 0;
    }
    printf("%d 是闰年\\n", year);
    return 0;
}`,
out:`输入分数：85
良好
2024 是闰年`,
tips:["判断范围时用 a <= x && x < b，不要写成 a <= x < b（后者在 C 里恒为真）。",
"浮点不要直接 == 比较，用容差。"]},

{t:"21 关系运算符与浮点比较的老坑",
d:"a < b < c 在 C 里是合法的，但结果几乎永远为真。这不是语法错误，编译器也救不了你。",
body:[
"p:关系运算符 < <= > >= == != 的结果是 0 或 1。所以 a < b < c 会被解析成 (a < b) < c，也就是「把 0 或 1 拿去跟 c 比」。如果 c 大于 1，整个表达式恒为真。",
"h:正确写法",
"code:if (a < b && b < c) { ... }",
"h:浮点比较",
"p:浮点不能用 == 直接比（原因见 0.1+0.2 那篇）。要判断相等用容差，要判断大小关系可以直接比，但涉及「差值」时要小心：两个很接近的数相减会丢精度，这叫**灾难性抵消**。",
"h:三个常被忽略的比较陷阱",
"ul:char 比较有符号性：signed char 里 0xFF 是 -1，比 'a' 小|无符号与有符号混比：if (u > -1) 当 u 是 unsigned 时 -1 会被转成 UINT_MAX，结果恒为假|字符串不能用 == 比较内容：那只比较了地址，必须用 strcmp",
"note:比较字符串是否相同写 if (strcmp(a, b) == 0)，返回 0 表示相等，这个「反直觉」的约定来自「返回差值」的实现方式。"
],
code:`#include <stdio.h>
#include <string.h>
#include <math.h>

int main(void)
{
    int a = 3, b = 5, c = 1;

    printf("%d\\n", a < b < c);            // (3<5)=1, 1<1=0 → 0（碰巧对了）
    printf("%d\\n", b < a < c);            // (5<3)=0, 0<1=1 → 1（错的！）
    printf("%d\\n", a < b && b < c);       // 0，正确写法

    double x = 0.1 * 3;
    printf("x == 0.3 ? %d\\n", x == 0.3);  // 0
    printf("容差比较 ? %d\\n", fabs(x - 0.3) < 1e-9);

    // 字符串比较
    char s1[] = "abc", s2[] = "abc";
    printf("== 比地址: %d\\n", s1 == s2);          // 0
    printf("strcmp 比内容: %d\\n", strcmp(s1, s2)); // 0

    // 有符号 / 无符号混比
    unsigned u = 1;
    printf("u > -1 ? %d\\n", u > -1);       // 0，-1 被转成 4294967295
    return 0;
}`,
out:`0
1
0
x == 0.3 ? 0
容差比较 ? 1
== 比地址: 0
strcmp 比内容: 0
u > -1 ? 0`,
tips:["-Wsign-compare 会提示有符号无符号混比，强烈建议打开。",
"数组名比较的是地址，两个内容相同的数组 s1 == s2 永远是 0。"]},

{t:"22 switch / case：多分支的另一条路",
d:"switch 只能对整数（含 char、枚举）做等值判断，不能判范围。漏写 break 会「贯穿」到下一个分支。",
body:[
"p:switch 适合「一个变量的值有多种离散可能」的场景，比如菜单、状态机、字符分类。语法：",
"code:switch (表达式) {\ncase 常量1: 语句; break;\ncase 常量2: 语句; break;\ndefault: 语句;\n}",
"h:四条硬规则",
"ul:表达式的类型必须是整数（int/char/enum），不能是 float 或字符串|case 后面必须是**常量表达式**，不能是变量|不写 break 会继续执行下一个 case，这叫 fallthrough（贯穿）|default 不是必须的，但建议always写，用来兜底",
"h:贯穿有时候是故意的",
"p:多个 case 共用一段逻辑时，故意不写 break：",
"code:case 'a': case 'e': case 'i': case 'o': case 'u':\n    printf(\"元音\\n\");\n    break;",
"p:但如果是不小心漏了 break，编译器只能靠 -Wimplicit-fallthrough 提醒你。",
"h:switch 与 if 的选择",
"ul:离散值、分支多 → switch，编译器可能生成跳转表，比一串 if-else 快|范围判断、复合条件 → if|C 的 switch 不支持范围，GCC 扩展的 case 1 ... 10 不可移植",
"note:switch 里定义变量要加花括号限定作用域，否则会报「跳转绕过变量初始化」的错。"
],
code:`#include <stdio.h>

// 简单计算器：用 switch 分发运算符
int main(void)
{
    double a, b;
    char op;
    printf("输入式子（如 3 + 4）：");
    if (scanf("%lf %c %lf", &a, &op, &b) != 3) return 0;   // 没有输入就直接结束

    switch (op) {
        case '+': printf("%.2f\\n", a + b); break;
        case '-': printf("%.2f\\n", a - b); break;
        case '*': printf("%.2f\\n", a * b); break;
        case '/':
            if (b == 0) printf("除数不能为 0\\n");
            else        printf("%.2f\\n", a / b);
            break;
        case '%': printf("%d\\n", (int)a % (int)b); break;
        default:  printf("不认识的运算符\\n");
    }

    // 故意贯穿：元音判断
    char ch = 'e';
    switch (ch) {
        case 'a': case 'e': case 'i': case 'o': case 'u':
            printf("%c 是元音\\n", ch); break;
        default:
            printf("%c 是辅音\\n", ch);
    }
    return 0;
}`,
out:`输入式子（如 3 + 4）：8 / 2
4.00
e 是元音`,
tips:["不要在 case 里定义变量后跨 case 使用，作用域是整个 switch，容易出诡异 bug。",
"忘记 default 时，非法输入会静默什么都不做，排查起来很费劲。"]},

{t:"23 条件运算符 ?: 与逗号表达式",
d:"a ? b : c 是三目运算符，适合「二选一取值」，不适合写复杂逻辑。逗号表达式则几乎只在 for 循环里有存在价值。",
body:[
"p:三目运算符是 C 里唯一的三目运算符，形式为 条件 ? 值1 : 值2。条件为真取「值1」，否则取「值2」。它返回的是**值**，所以可以直接参与运算或赋值。",
"h:什么时候用它",
"ul:取最大值：max = a > b ? a : b|输出不同文字：printf(\"%s\", n > 0 ? \"正\" : \"负\")|嵌套：可以写，但超过两层就该换成 if",
"h:容易踩的坑",
"ul:优先级很低，赋值和它混用时必须加括号：x = (a > b ? a : b) + 1|两个分支的类型会做统一：一个 int 一个 double，结果是 double|别用它替换有副作用的语句，可读性会崩",
"h:逗号表达式",
"p:逗号运算符会「从左到右依次求值，整个表达式的值是最后一个」。它最常见的用途是让 for 循环同时维护两个变量：",
"code:for (int i = 0, j = 10; i < j; i++, j--) { ... }",
"p:注意：函数参数之间的逗号**不是**逗号运算符，是分隔符。f(a, b) 里的逗号不参与求值顺序约定。",
"note:?(冒号) 在 C 里还有别的用途：位域和结构体初始化，别和三目搞混。"
],
code:`#include <stdio.h>

int main(void)
{
    int a = 3, b = 7;
    int max = a > b ? a : b;
    printf("max = %d\\n", max);

    // 优先级：三目低于赋值右边的大多数运算符
    int x = (a > b ? a : b) + 1;
    printf("x = %d\\n", x);

    // 类型统一：一个 int 一个 double → double
    printf("%.2f\\n", a > b ? a : 2.5);

    // 判断奇偶并输出文字
    for (int i = 1; i <= 4; i++)
        printf("%d 是%s\\n", i, i % 2 ? "奇数" : "偶数");

    // 逗号表达式：双指针向中间靠拢
    int arr[] = {1, 2, 3, 4, 5};
    for (int i = 0, j = 4; i < j; i++, j--) {
        int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,
out:`max = 7
x = 8
3.00
1 是奇数
2 是偶数
3 是奇数
4 是偶数
5 4 3 2 1 `,
tips:["parse 三目时：条件部分最后加括号，避免和比较运算符混在一起读不懂。",
"三目嵌套超过两层，直接改 if-else，可读性比代码短更重要。"]},

{t:"24 while 与 do-while：先判断还是先执行",
d:"while 可能一次都不执行；do-while 至少执行一次。这个差别在做输入校验时非常关键。",
body:[
"p:while (条件) 语句：先判断条件，为真才执行循环体。所以如果一开始条件就是假，循环体一次也不跑。",
"p:do 语句 while (条件);：先执行一次，再判断。注意结尾的分号不能少——这是 C 里少数必须带分号的「语句块」。",
"h:什么时候必须用 do-while",
"p:「先做一次，再决定要不要继续」的场景：读菜单直到用户选退出、生成随机数直到满足条件、读输入直到格式正确。用 while 写这些要么重复代码，要么引入一个假的初始值。",
"h:三个死循环成因",
"ul:循环变量忘了更新：while (i < 10) { printf(...); }|条件永远成立：while (n != 1) 里 n 只增不减|浮点比较永真：while (x != 1.0) 里 x 每次加 0.1，永远差一点",
"h:空循环体",
"p:while (getchar() != '\\n') ; 这种写法里，分号就是循环体。写成 while (x); 时建议单独一行写 ; 或者用 {} 明确表示「故意空着」，否则以后维护的人会以为漏了代码。",
"note:循环三要素：初值、条件、更新。写完循环先检查这三样都在不在，能消灭大半死循环。"
],
code:`#include <stdio.h>

int main(void)
{
    // while：可能一次都不执行
    int i = 10;
    while (i < 5) {
        printf("这行不会打印\\n");
        i++;
    }

    // do-while：至少执行一次，适合输入校验
    int n;
    do {
        printf("请输入 1~100 的数：");
        if (scanf("%d", &n) != 1) {
            int ch;
            while ((ch = getchar()) != '\\n' && ch != EOF) { }  // 清掉非法输入
            if (ch == EOF) return 0;   // 输入结束就退出，别在这儿空转
            n = 0;
        }
    } while (n < 1 || n > 100);
    printf("收到 %d\\n", n);

    // 用 while 求各位数字之和
    int x = 9876, sum = 0;
    while (x > 0) {
        sum += x % 10;
        x /= 10;
    }
    printf("数位和 %d\\n", sum);
    return 0;
}`,
out:`请输入 1~100 的数：150
请输入 1~100 的数：42
收到 42
数位和 30`,
tips:["do-while 结尾的分号最容易漏，漏了会报奇怪的语法错误。",
"循环条件里不要写有副作用的表达式，比如 while (i++ < 10)，边界容易差一。"]},

{t:"25 for 循环：三段式的执行顺序",
d:"for (初始化; 条件; 更新) 的执行顺序是「初始化 → 条件 → 循环体 → 更新 → 条件 → ...」，不是「初始化 → 条件 → 更新 → 循环体」。",
body:[
"p:for 把循环三要素集中在一行，是最常用的循环结构。它的执行流程值得单独记一遍：",
"ul:1. 初始化，只执行一次|2. 判断条件，为假就结束|3. 执行循环体|4. 执行更新表达式|5. 回到第 2 步",
"h:C99 的 for 内声明变量",
"p:for (int i = 0; ...) 里的 i 作用域只在循环内，循环结束就消失。这在 C89 里是非法的，老编译器要写成 for (i = 0; ...) 并在外面先声明 int i。",
"h:几种变形",
"ul:省略初始化：for (; i < n; i++)|省略更新：for (int i = 0; i < n; ) { ... i++; }|死循环：for (;;) 或 while (1)|多变量：for (int i = 0, j = n - 1; i < j; i++, j--)|倒序：for (int i = n - 1; i >= 0; i--) —— i 必须是有符号的",
"h:边界怎么写不容易错",
"p:遍历长度为 n 的数组用 i < n（不是 i <= n）；循环 n 次用 i < n；从 1 数到 n 用 i <= n。写完先在心里跑 n=0 和 n=1 两个边界。",
"note:嵌套循环时，内层循环的次数是「外层每一轮都完整跑一遍」，总次数是两者相乘。想优化先看内层有没有可以提到外层的重复计算。"
],
code:`#include <stdio.h>

int main(void)
{
    // 打印乘法表（嵌套循环）
    for (int i = 1; i <= 4; i++) {
        for (int j = 1; j <= i; j++)
            printf("%d*%d=%-3d", j, i, i * j);
        printf("\\n");
    }

    // 倒序：i 必须是有符号类型
    for (int i = 3; i >= 0; i--) printf("%d ", i);
    printf("\\n");

    // 双指针：判断回文
    char s[] = "level";
    int len = 5, ok = 1;
    for (int i = 0, j = len - 1; i < j; i++, j--) {
        if (s[i] != s[j]) { ok = 0; break; }
    }
    printf("%s 是回文吗：%d\\n", s, ok);

    // 求 1~100 里所有偶数的和
    int sum = 0;
    for (int i = 2; i <= 100; i += 2) sum += i;
    printf("偶数和 %d\\n", sum);
    return 0;
}`,
out:`1*1=1  
1*2=2  2*2=4  
1*3=3  2*3=6  3*3=9  
1*4=4  2*4=8  3*4=12 4*4=16 
3 2 1 0 
level 是回文吗：1
偶数和 2550`,
tips:["-Wall 会提示 for 循环里声明但未使用的变量，别忽略。",
"C89 不支持 for 内声明，写兼容老编译器的代码时把 int i 提到外面。"]},

{t:"26 break、continue 与 goto",
d:"break 跳出整个循环，continue 只跳过本轮。goto 不是洪水猛兽，但 99% 的场合都不该用。",
body:[
"p:这三个都是「跳转」语句，用途完全不同：",
"ul:break：立刻跳出**最内层**的 switch 或循环|continue：跳过本轮剩下的语句，直接进入下一轮|goto：跳到同一函数内的某个标签",
"h:break 只跳一层",
"p:嵌套循环里 break 只退出内层。想一次退出两层，有三种做法：设一个标志变量在外层判断、把循环封装成函数直接 return、用 goto。",
"h:continue 的边界陷阱",
"p:while 循环里用 continue 时，如果「更新」写在循环体末尾，continue 会跳过它，直接导致死循环：",
"code:int i = 0;\nwhile (i < 10) {\n    i++;\n    if (i % 2 == 0) continue;   // 这里没问题，因为 i++ 在前面\n    printf(\"%d\", i);\n}",
"p:for 循环没这个风险，因为更新表达式是循环机制的一部分，continue 之后仍会执行。这也是 for 比 while 更适合计数循环的原因之一。",
"h:goto 的正确用途",
"p:Linux 内核里大量使用 goto 做**统一错误处理**：申请了多份资源，出错时 goto 到对应的清理标签，避免写重复的 free 代码。除此之外，滥用 goto 会让流程变成一团乱麻，所以教科书普遍劝退。",
"note:标签后面要跟冒号，且标签名不能和变量名冲突。goto 不能跨函数跳转。"
],
code:`#include <stdio.h>
#include <stdlib.h>   // malloc / free

int main(void)
{
    // break：找到就停
    int arr[] = {3, 8, 1, 9, 4};
    for (int i = 0; i < 5; i++) {
        if (arr[i] == 9) { printf("9 在下标 %d\\n", i); break; }
    }

    // continue：跳过偶数
    for (int i = 1; i <= 6; i++) {
        if (i % 2 == 0) continue;
        printf("%d ", i);
    }
    printf("\\n");

    // 用 goto 统一清理（模拟多资源申请）
    int *p1 = NULL, *p2 = NULL;
    int ret = 0;
    p1 = (int *)malloc(sizeof(int));
    if (!p1) { ret = -1; goto cleanup; }
    p2 = (int *)malloc(sizeof(int));
    if (!p2) { ret = -2; goto cleanup; }
    printf("两份资源都拿到了\\n");

cleanup:
    free(p1);
    free(p2);
    printf("清理完成 ret=%d\\n", ret);
    return 0;
}`,
out:`9 在下标 3
1 3 5 
两份资源都拿到了
清理完成 ret=0`,
tips:["goto 只能在本函数内跳，不能跨函数，也不能跳过变量初始化。",
"break 在 switch 里只跳出 switch，不跳出外层循环。"]},

/* ================= 第 5 章 数组 ================= */
{c:"📚 第 5 章 数组与字符串",
t:"27 一维数组：定义、初始化与遍历",
d:"数组是一块连续的、同类型的内存。长度在定义时确定，之后不能改；下标从 0 开始，越界不报错但会出事。",
body:[
"p:数组的定义形式：类型 名字[长度]。长度必须是编译期常量（C99 的变长数组除外），且定义后不能改变。",
"h:初始化的四种写法",
"ul:int a[5]; —— 不初始化，里面是垃圾值|int a[5] = {1, 2, 3}; —— 前三个赋值，其余自动为 0|int a[5] = {0}; —— 全部置 0 的惯用写法|int a[] = {1, 2, 3}; —— 长度由初始化列表自动推断为 3",
"p:注意 int a[5] = {0} 只把第一个元素写成 0，其余「补零」是 C 标准规定的行为，不是碰巧。而 int a[5]; 在函数内部是**未初始化**的，值不确定。",
"h:遍历的标准写法",
"code:for (int i = 0; i < n; i++) { ... a[i] ... }",
"p:n 是元素个数，所以条件是 i < n，不是 i <= n。这个「差一错误」（off-by-one）是数组相关 bug 的头号来源。",
"h:求长度",
"code:int n = sizeof(a) / sizeof(a[0]);",
"p:这招只在数组**还在当前作用域**时有效。数组作为参数传给函数后会退化成指针，sizeof 就只能得到指针大小（8 字节）。",
"note:数组不能整体赋值：b = a 是非法的，必须逐个元素拷贝或用 memcpy。"
],
code:`#include <stdio.h>

int main(void)
{
    int a[5];                    // 未初始化，内容是垃圾值
    int b[5] = {1, 2, 3};        // 前三个 1 2 3，其余 0
    int c[5] = {0};              // 全部 0
    int d[] = {4, 5, 6};         // 长度自动推为 3

    printf("b: %d %d %d %d %d\\n", b[0], b[1], b[2], b[3], b[4]);
    printf("d 的长度: %zu\\n", sizeof(d) / sizeof(d[0]));

    // 求最大值、最小值、平均值
    int arr[] = {3, 7, 1, 9, 4};
    int n = sizeof(arr) / sizeof(arr[0]);
    int max = arr[0], min = arr[0], sum = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
        sum += arr[i];
    }
    printf("max=%d min=%d avg=%.2f\\n", max, min, (double)sum / n);

    // 逆序输出
    for (int i = n - 1; i >= 0; i--) printf("%d ", arr[i]);
    printf("\\n");
    (void)a;
    return 0;
}`,
out:`b: 1 2 3 0 0
d 的长度: 3
max=9 min=1 avg=4.80
4 9 1 7 3 `,
tips:["int a[5]; 在 main 里不初始化就是随机值，别指望它是 0。",
"数组不能整体赋值或比较，a = b、a == b 都是错的。"]},

{t:"28 数组越界：为什么它不报错，却最危险",
d:"C 不做下标检查。a[10] 能编译能运行，写进去的就是别人家的内存。这类 bug 往往在很久以后、在别的函数里才炸。",
body:[
"p:数组下标从 0 到 n-1。访问 a[n] 属于**越界**，C 标准说是未定义行为（UB）——不保证崩溃，不保证报错，什么都不保证。",
"h:越界会发生什么",
"ul:读到相邻变量的值（看起来「程序还能跑」）|写坏相邻变量（最难查：某个变量莫名其妙变了）|写到栈保护页 → 段错误崩溃|最坏情况：被利用做缓冲区溢出攻击",
"h:三个高频越界场景",
"ul:for (int i = 0; i <= n; i++) —— 多跑一轮|字符串忘了 \\0 的位置：char s[5] = \"hello\" 装不下 6 字节|scanf(\"%s\", buf) 输入超长，直接写穿",
"h:怎么防",
"ul:循环条件统一用 i < n，不要用 <= 配合 n-1 之外的写法|字符串一律用 fgets / snprintf，不用 gets / sprintf|用 -fsanitize=address 编译，运行时能精确定位越界位置|关键函数入口做长度检查",
"note:ASan（AddressSanitizer）是排查内存问题的神器：gcc -fsanitize=address -g x.c，运行时越界、泄漏、悬空指针全都能报出行号。"
],
code:`#include <stdio.h>

int main(void)
{
    int a[5] = {0};
    int neighbor = 12345;        // 故意放在数组旁边

    printf("越界前 neighbor = %d\\n", neighbor);

    // 越界写：不报错，但改的是别人的内存
    a[5] = 999;                  // 未定义行为！
    printf("越界后 neighbor = %d（可能被改）\\n", neighbor);

    // 更隐蔽：循环差一
    int b[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i <= 5; i++)   // 应该是 i < 5
        sum += b[i];               // 第 6 次读的是越界内存
    printf("sum = %d（结果不可信）\\n", sum);
    return 0;
}`,
out:`越界前 neighbor = 12345
越界后 neighbor = 999（可能被改）
sum = ...（结果不可信）`,
tips:["调试内存问题先加 -fsanitize=address，比 printf 大法快十倍。",
"任何来自外部的长度（文件、网络、用户输入）都要先校验再用。"]},

{t:"29 二维数组：行优先存储与指针理解",
d:"int a[3][4] 不是「三个数组」，而是一整块 12 个 int 的连续内存，只是访问时按行列换算下标。",
body:[
"p:二维数组的定义：类型 名字[行数][列数]。它在内存中是**按行连续存放**的：a[0][0]、a[0][1] ... a[0][3]、a[1][0] ... 依次排开，没有真正的「行」边界。",
"h:初始化的几种写法",
"ul:int a[2][3] = {{1,2,3},{4,5,6}}; —— 按行分组，最清晰|int a[2][3] = {1,2,3,4,5,6}; —— 顺序填，不推荐|int a[2][3] = {{1},{4}}; —— 只填每行第一个，其余补 0|int a[][3] = {{1,2,3},{4,5,6}}; —— 行数可省，列数不能省",
"h:遍历",
"p:两层循环，外层行、内层列。内层循环访问的是连续内存，缓存友好；反过来先列后行，性能会明显变差（这叫 cache miss）。",
"h:作为函数参数",
"p:二维数组传参必须指定列数：void f(int a[][3], int rows)。因为编译器要知道「一行多长」才能算出 a[i][j] 的地址。",
"code:地址公式：&a[i][j] = a + (i * 列数 + j) * sizeof(int)",
"note:把二维数组当一维用是合法且常见的优化：int *p = &a[0][0]，然后 p[i*cols+j] 遍历，能避免嵌套循环的开销。"
],
code:`#include <stdio.h>

#define ROWS 3
#define COLS 4

int main(void)
{
    int a[ROWS][COLS] = {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };

    // 按行打印
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++)
            printf("%3d", a[i][j]);
        printf("\\n");
    }

    // 每行的和
    for (int i = 0; i < ROWS; i++) {
        int sum = 0;
        for (int j = 0; j < COLS; j++) sum += a[i][j];
        printf("第 %d 行和 = %d\\n", i + 1, sum);
    }

    // 验证内存连续性
    int *p = &a[0][0];
    printf("按一维展开: ");
    for (int i = 0; i < ROWS * COLS; i++) printf("%d ", p[i]);
    printf("\\n");

    // 地址公式：a[1][2] 等价于 *(p + 1*COLS + 2)
    printf("a[1][2]=%d, *(p+6)=%d\\n", a[1][2], *(p + 1 * COLS + 2));
    return 0;
}`,
out:`  1  2  3  4
  5  6  7  8
  9 10 11 12
第 1 行和 = 10
第 2 行和 = 26
第 3 行和 = 42
按一维展开: 1 2 3 4 5 6 7 8 9 10 11 12 
a[1][2]=7, *(p+6)=7`,
tips:["二维数组做参数时列数必须写死：void f(int a[][4])，写成 int a[][] 会编译失败。",
"越界检查要分别检查行和列，a[3][0] 和 a[0][4] 都是越界。"]},

{t:"30 字符数组与字符串：\\0 决定一切",
d:"C 没有字符串类型。所谓字符串，就是「以 \\0 结尾的 char 数组」。没有 \\0，它就不是字符串，只是一堆字节。",
body:[
"p:字符串字面量 \"hello\" 在内存里是 6 个字节：h e l l o \\0。所有的字符串函数（strlen、strcpy、printf 的 %s）都靠这个 \\0 判断什么时候结束。",
"h:三种定义方式的区别",
"ul:char s[] = \"hello\"; —— 数组，长度 6（含 \\0），可修改|char *s = \"hello\"; —— 指向只读常量区，**不能改**，改了会崩|char s[20] = \"hello\"; —— 数组，长度 20，后面补 0，最安全",
"p:sizeof 和 strlen 的结果不一样：sizeof(s) 是数组总字节数（含 \\0 和未用空间），strlen(s) 是到 \\0 为止的字符数（不含 \\0）。",
"h:手动构造字符串",
"code:char s[6];\ns[0]='h'; s[1]='e'; s[2]='l'; s[3]='l'; s[4]='o';\ns[5]='\\0';   // 少这一行，printf 会一直往后读，直到撞上随机的 0",
"h:中文字符串",
"p:UTF-8 下一个汉字占 3 字节，所以 char s[] = \"你好\" 需要 7 字节（3+3+1）。strlen 返回的是**字节数** 6，不是字符数 2。要按「字数」处理，得用宽字符或专门的 UTF-8 库。",
"note:字符串数组（多个字符串）用 char names[3][20] 或 char *names[] = {\"a\",\"b\",\"c\"}。后者更省内存，但不能修改内容。"
],
code:`#include <stdio.h>
#include <string.h>

int main(void)
{
    char s1[] = "hello";        // 数组，可改
    char s2[20] = "hello";      // 定长数组
    const char *s3 = "hello";   // 指向只读常量区

    printf("sizeof s1=%zu, strlen s1=%zu\\n", sizeof(s1), strlen(s1));
    printf("sizeof s2=%zu, strlen s2=%zu\\n", sizeof(s2), strlen(s2));

    s1[0] = 'H';
    printf("%s\\n", s1);         // Hello
    // s3[0] = 'H';             // 运行时崩溃：只读区

    // 手动构造字符串
    char t[6];
    t[0] = 'w'; t[1] = 'o'; t[2] = 'r'; t[3] = 'l'; t[4] = 'd'; t[5] = '\\0';
    printf("%s 长度 %zu\\n", t, strlen(t));

    // 中文字符串：字节数 ≠ 字数
    char cn[] = "你好";
    printf("sizeof=%zu strlen=%zu\\n", sizeof(cn), strlen(cn));
    return 0;
}`,
out:`sizeof s1=6, strlen s1=5
sizeof s2=20, strlen s2=5
Hello
world 长度 5
sizeof=7 strlen=6`,
tips:["char *s = \"abc\" 之后 s[0] = 'x' 是未定义行为，通常直接段错误。",
"strlen 返回 size_t（无符号），for (int i = 0; i < strlen(s); i++) 这种写法每次都会重算，改成先存长度。"]},

{t:"31 字符串函数族：strlen / strcpy / strcat / strcmp",
d:"string.h 的这四件套是 C 字符串的全部基础设施。它们都不检查目标大小——安全责任在你身上。",
body:[
"h:四个核心函数",
"ul:strlen(s) 求长度（不含 \\0），返回 size_t|strcpy(dst, src) 复制，含 \\0，**不检查 dst 多大**|strcat(dst, src) 追加到 dst 末尾，同样不检查|strcmp(a, b) 比较，返回 <0 / 0 / >0，0 表示相等",
"p:strcmp 返回的是「第一个不同字符的差值」，不是布尔值。所以判断相等要写 strcmp(a,b) == 0，不能写 if (strcmp(a,b))。",
"h:安全版本",
"ul:strncpy(dst, src, n) 最多复制 n 字节，但**不保证补 \\0**|strncat(dst, src, n) 最多追加 n 字节，会自动补 \\0（相对安全）|snprintf(dst, size, \"%s\", src) 最推荐的替代方案|strlcpy / strlcat 是 BSD 扩展，跨平台不一定有",
"h:其他常用",
"ul:strchr(s, c) 找字符，返回指针|strstr(s, sub) 找子串|strtok(s, delim) 分割字符串（会破坏原串，且不可重入）|memcpy / memmove / memset 处理任意内存块|atoi / strtol 字符串转数字（strtol 能报错，更安全）",
"warn:strtok 用了静态内部状态，多线程或嵌套调用会出问题，新代码建议用 strtok_r 或手写解析。",
"note:判断前缀用 strncmp(s, \"abc\", 3) == 0，比先截取再比较高效得多。"
],
code:`#include <stdio.h>
#include <stdlib.h>   // strtol
#include <string.h>

int main(void)
{
    char a[32] = "Hello";
    char b[32] = "World";
    char buf[64];

    printf("strlen: %zu\\n", strlen(a));

    // 复制 + 拼接
    strcpy(buf, a);
    strcat(buf, ", ");
    strcat(buf, b);
    printf("%s\\n", buf);

    // 安全拼接
    char safe[16] = "abc";
    strncat(safe, "1234567890123", sizeof(safe) - strlen(safe) - 1);
    printf("安全拼接: %s\\n", safe);

    // 比较（注意返回 0 才表示相等）
    printf("strcmp(a,b)=%d, strcmp(a,a)=%d\\n", strcmp(a, b), strcmp(a, a));

    // 查找
    char *p = strstr(buf, "World");
    printf("子串位置偏移: %ld\\n", p ? (long)(p - buf) : -1);
    printf("找字符: %s\\n", strchr(buf, 'W'));

    // 前缀判断
    printf("以 Hello 开头: %d\\n", strncmp(buf, "Hello", 5) == 0);

    // 转数字
    printf("strtol: %ld\\n", strtol("123abc", NULL, 10));
    return 0;
}`,
out:`strlen: 5
Hello, World
安全拼接: abc123456789012
strcmp(a,b)=-15, strcmp(a,a)=0
子串位置偏移: 7
找字符: World
以 Hello 开头: 1
strtol: 123`,
tips:["strncpy 不保证结尾有 \\0，用完必须手动 dst[n-1] = '\\0'。",
"strcat 之前一定要确认目标剩余空间够，否则就是缓冲区溢出。"]},

{t:"32 排序与查找：冒泡、选择、二分",
d:"排序是理解「双重循环 + 交换」最好的例子；二分是理解「有序能带来什么」最好的例子。前者 O(n²)，后者 O(log n)。",
body:[
"h:冒泡排序",
"p:相邻两个比较，大的往后换。每一轮把当前最大值「冒」到末尾，下一轮范围缩小一格。时间复杂度 O(n²)，最好情况（已有序）加个标志位可以做到 O(n)。",
"h:选择排序",
"p:每一轮在未排序区里找最小值，和未排序区的第一个交换。交换次数比冒泡少（最多 n-1 次），但比较次数不变，也是 O(n²)。",
"h:二分查找",
"p:前提是**数组已经有序**。每次和中间元素比，一次砍掉一半范围。100 万个元素最多 20 次比较。",
"code:int lo = 0, hi = n - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;   // 防止 lo+hi 溢出\n    if (a[mid] == target) return mid;\n    if (a[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n}\nreturn -1;",
"h:三个易错点",
"ul:循环条件是 lo <= hi，不是 lo < hi|mid 用 lo + (hi-lo)/2，避免大数相加溢出|更新必须是 lo = mid + 1 / hi = mid - 1，写成 lo = mid 会死循环",
"h:标准库的 qsort",
"p:实际项目直接用 qsort，它接受一个比较函数指针：qsort(arr, n, sizeof(arr[0]), cmp)。比较函数返回负数表示 a 应排在 b 前面。",
"note:理解排序的重点不是背代码，而是搞清楚「外层控制什么、内层控制什么、边界为什么是这个值」。写完用长度为 0、1、2 的数组各测一遍。"
],
code:`#include <stdio.h>
#include <stdlib.h>

static int cmp_int(const void *a, const void *b)
{
    return (*(const int *)a) - (*(const int *)b);
}

int main(void)
{
    int a[] = {5, 2, 9, 1, 7};
    int n = sizeof(a) / sizeof(a[0]);

    // 冒泡排序
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = 1;
            }
        }
        if (!swapped) break;          // 已有序，提前结束
    }
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\\n");

    // 二分查找
    int target = 7, lo = 0, hi = n - 1, ans = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) { ans = mid; break; }
        else if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    printf("7 的下标: %d\\n", ans);

    // 标准库排序
    int b[] = {4, 8, 2, 6};
    qsort(b, 4, sizeof(b[0]), cmp_int);
    for (int i = 0; i < 4; i++) printf("%d ", b[i]);
    printf("\\n");
    return 0;
}`,
out:`1 2 5 7 9 
7 的下标: 3
2 4 6 8 `,
tips:["二分查找必须先排序，对无序数组用二分是经典错误。",
"qsort 的比较函数返回 int，两个大数相减可能溢出，稳妥写法是分别返回 -1 / 1。"]}
]);

/* C 语言笔记 · 第 6~7 章：函数 / 指针 */
window.C_NOTES = (window.C_NOTES || []).concat([

/* ================= 第 6 章 函数 ================= */
{c:"🧩 第 6 章 函数",
t:"33 函数的定义、声明与调用",
d:"函数是 C 唯一的复用单位。定义写实现，声明写「长什么样」，调用时编译器只认声明，链接器才去找实现。",
body:[
"p:函数的三要素：返回类型、函数名、参数列表。定义分两部分：函数头和函数体。",
"code:返回类型 函数名(参数列表)\n{\n    语句;\n    return 值;\n}",
"h:定义、声明、调用是三件不同的事",
"ul:定义：给出完整实现，一个函数只能定义一次|声明（原型）：只给「长相」，以分号结尾，可以出现多次|调用：使用函数，此时编译器只需要见过声明",
"p:这就是为什么调用库函数要 #include 头文件——头文件里全是声明。也是为什么「没写声明就调用」在 C99 之后是错误：编译器无法检查参数类型。",
"h:参数与返回值",
"ul:没有参数写 void：int f(void)，不要写 int f()|没有返回值写 void：void show(void)|一个函数最多返回一个值，想返回多个要用指针参数或结构体|return 之后的语句永远不会执行",
"h:函数设计的三条经验",
"ul:一个函数只做一件事，函数名能说清楚这件事|参数不超过 5 个，多了说明该拆或该用结构体|尽量不依赖全局变量，靠参数传入、靠返回值传出，便于测试"
],
code:`#include <stdio.h>

// 声明（原型）：告诉编译器有这么个函数
int add(int x, int y);
void swap_wrong(int a, int b);
int max3(int a, int b, int c);

int main(void)
{
    printf("%d\\n", add(2, 3));       // 调用
    printf("%d\\n", max3(4, 9, 2));
    return 0;
}

// 定义：完整实现
int add(int x, int y)
{
    return x + y;
}

int max3(int a, int b, int c)
{
    int m = a > b ? a : b;
    return m > c ? m : c;
}`,
out:`5
9`,
tips:["定义和声明不一致（比如声明 int f(int)，定义 float f(float)）在 C 里是编译错误，别以为能自动匹配。",
"没写返回类型的老写法 f() 默认返回 int，C99 已废弃，不要用。"]},

{t:"34 形参、实参，以及「值传递」的真相",
d:"函数拿到的是实参的**副本**，改副本不影响原变量。scanf 要加 &、swap 要用指针，根源都在这里。",
body:[
"p:**形参**是函数定义里声明的变量，**实参**是调用时传进去的值。C 只有一种传参方式：值传递——把实参的值复制一份给形参。",
"h:为什么会这样",
"p:函数调用时，系统在栈上为形参分配空间，然后把实参的值拷贝进去。函数体里操作的始终是这份副本，函数返回时栈帧销毁，原变量毫发无损。",
"h:经典错误：swap 交换不了",
"code:void swap(int a, int b) { int t = a; a = b; b = t; }   // 无效\nvoid swap(int *a, int *b) { int t = *a; *a = *b; *b = t; } // 有效\n// 调用：swap(&x, &y);",
"p:第一版交换的是两个副本，函数一返回就没了。第二版传的是地址，函数通过地址直接改原变量，这才生效。",
"h:数组看起来能「传进去改」",
"p:因为数组名会退化成指针，传数组其实是传了首元素地址。所以函数里改 a[i] 会影响原数组——这不是值传递失效，而是「传的值本身就是一个地址」。",
"warn:这也意味着函数无法通过 sizeof 得知数组长度，必须额外传一个长度参数，这是 C 语言的硬性限制。",
"note:一句话总结：C 里函数只能改「你传进去的地址指向的东西」，改不了「你传进去的值本身」。"
],
code:`#include <stdio.h>

// 值传递：改不动外面
void try_change(int x)
{
    x = 100;
}

// 地址传递：改得动
void real_change(int *p)
{
    *p = 100;
}

// 数组参数会退化成指针
void fill(int a[], int n)
{
    for (int i = 0; i < n; i++) a[i] = i * i;
    printf("函数内 sizeof(a) = %zu（只是指针大小）\\n", sizeof(a));
}

int main(void)
{
    int a = 1;
    try_change(a);
    printf("a = %d\\n", a);       // 1

    real_change(&a);
    printf("a = %d\\n", a);       // 100

    int arr[5];
    fill(arr, 5);                 // 必须额外传长度
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);
    printf("\\n");
    printf("main 里 sizeof(arr)/sizeof(arr[0]) = %zu\\n",
           sizeof(arr) / sizeof(arr[0]));
    return 0;
}`,
out:`a = 1
a = 100
函数内 sizeof(a) = 8（只是指针大小）
0 1 4 9 16 
main 里 sizeof(arr)/sizeof(arr[0]) = 5`,
tips:["想通过函数改变实参，就传地址；不想改，就传值——这是接口设计的第一道决策。",
"函数里不要对数组参数用 sizeof 求长度，一定是错的。"]},

{t:"35 作用域与生命周期：局部、全局、static",
d:"作用域管「能不能看见」，生命周期管「活多久」。static 变量是唯一「看不见但一直活着」的例外。",
body:[
"h:三种作用域",
"ul:局部变量：函数或块内定义，出了 } 就看不见|全局变量：所有函数外面定义，整个文件可见（加 extern 可跨文件）|块级变量：{} 里定义的，C99 起才支持在语句中间定义",
"h:四种生命周期",
"ul:自动变量（auto，默认）：栈上分配，进入作用域创建，离开销毁，值不确定|全局变量：程序启动时创建，结束时销毁，**默认初始化为 0**|静态局部变量（static）：程序启动时创建，函数返回后仍存在，只初始化一次|静态全局变量：只在当前文件可见，其他文件访问不到",
"h:static 的两个完全不同的含义",
"p:在函数内：改变**生命周期**（变成常驻）。在函数外：改变**链接性**（其他文件看不见）。这是 C 里最容易混淆的关键字之一。",
"h:全局变量的代价",
"p:任何人都能改、难以追踪、多线程下要加锁、命名容易冲突。工程上能用参数传就别用全局，需要共享状态时优先考虑「上下文结构体 + 指针传递」。",
"note:未初始化的全局变量在 .bss 段，初始化为 0 的也在 .bss（只记录大小不占文件体积）；初始化为非 0 的在 .data 段，会占可执行文件空间。这就是「全局变量默认是 0、局部变量是垃圾」的底层原因。"
],
code:`#include <stdio.h>

int g_count;                  // 全局：默认初始化为 0

void counter(void)
{
    static int calls;         // 静态局部：只初始化一次，函数返回后仍存活
    int local = 0;            // 自动变量：每次调用重新创建
    calls++;
    local++;
    printf("calls=%d local=%d\\n", calls, local);
}

int main(void)
{
    printf("全局变量初始值: %d\\n", g_count);
    counter();   // calls=1 local=1
    counter();   // calls=2 local=1
    counter();   // calls=3 local=1

    {
        int inner = 5;        // 块级作用域
        printf("块内 %d\\n", inner);
    }
    // printf("%d", inner);   // 编译错误：出了块就看不见
    return 0;
}`,
out:`全局变量初始值: 0
calls=1 local=1
calls=2 local=1
calls=3 local=1
块内 5`,
tips:["static 局部变量多线程下不是线程安全的，别用它做「全局计数器」。",
"全局变量命名加前缀（g_）能减少和库函数重名的概率。"]},

{t:"36 递归：先递下去，再归回来",
d:"递归不是「函数调用自己」这么简单，关键是「每层问题都更小」和「有一个明确的终点」。",
body:[
"p:递归函数必须满足两个条件，少一个就会栈溢出或算错：",
"ul:终止条件（base case）：问题小到可以直接回答，不再递归|递推关系：把规模 n 的问题化成规模更小的同类问题",
"h:执行过程：先递后归",
"p:以 fact(4) 为例：先一路「递」下去 fact(4)→fact(3)→fact(2)→fact(1)，到终止条件后开始「归」：1→2→6→24。函数调用栈上同时存在 4 个栈帧，每一层都在等下一层的结果。",
"h:递归的三类问题",
"ul:线性递归：阶乘、求和、链表遍历，深度 = n|树形递归：斐波那契（朴素版）、汉诺塔、全排列|分治：归并排序、快速排序、二分查找",
"h:斐波那契的陷阱",
"p:朴素递归 fib(n) = fib(n-1) + fib(n-2) 的时间复杂度是 O(2^n)，因为同一个子问题被重复计算了无数遍。n=40 就要跑十几秒。改成「记忆化」（存下算过的值）或直接写迭代，复杂度降到 O(n)。",
"warn:递归深度受栈大小限制，一般几万层就会栈溢出。处理可能很深的线性结构（如长链表）时，用循环更安全。",
"note:写递归的顺序建议：先写终止条件，再写「假设子问题已经解决，我该怎么用它」。后者叫递归信任，能避免在脑子里展开整个调用树。"
],
code:`#include <stdio.h>

// 阶乘：线性递归
long long fact(int n)
{
    if (n <= 1) return 1;          // 终止条件
    return n * fact(n - 1);        // 规模减小
}

// 斐波那契：朴素递归（慢）+ 迭代（快）
long long fib_slow(int n)
{
    if (n <= 1) return n;
    return fib_slow(n - 1) + fib_slow(n - 2);
}

long long fib_fast(int n)
{
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long t = a + b;
        a = b;
        b = t;
    }
    return b;
}

// 汉诺塔：树形递归
void hanoi(int n, char from, char to, char via)
{
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    printf("%c -> %c\\n", from, to);
    hanoi(n - 1, via, to, from);
}

int main(void)
{
    printf("5! = %lld\\n", fact(5));
    printf("fib(10) = %lld / %lld\\n", fib_slow(10), fib_fast(10));
    hanoi(3, 'A', 'C', 'B');
    return 0;
}`,
out:`5! = 120
fib(10) = 55 / 55
A -> C
A -> B
C -> B
A -> C
B -> A
B -> C
A -> C`,
tips:["递归函数里不要定义大数组，每层栈帧都占空间，很容易爆栈。",
"能用迭代解决的简单循环（求和、阶乘）优先用迭代，递归留给树、图、分治这类天然递归的结构。"]},

{t:"37 函数与数组、二维数组传参",
d:"数组传参退化成指针，二维数组必须指定列数，函数指针则是把「行为」当参数传进去。",
body:[
"p:这是函数章节里最容易被考试和面试问到的部分。",
"h:三种等价的写法",
"code:void f(int a[], int n);\nvoid f(int *a, int n);\nvoid f(int a[10], int n);   // 10 会被忽略，完全等价于上面的指针",
"p:数组名作为实参时，传递的是首元素地址。函数内部拿到的只是一个指针，**不知道长度**，所以长度必须单独传。",
"h:二维数组传参",
"p:必须指定列数：void f(int a[][4], int rows)。因为编译器要用「列数」来计算 a[i][j] 的偏移量。也可以写成指针形式：void f(int (*a)[4], int rows)。",
"h:函数指针：把函数当参数",
"p:函数名本身就代表函数的地址。声明一个函数指针：返回类型 (*名字)(参数类型)。",
"code:int (*cmp)(const void *, const void *);\nqsort(arr, n, sizeof(arr[0]), cmp);   // 传函数地址",
"p:这是 C 实现「回调」「策略模式」的方式。qsort、bsearch 都靠它。注意 int *f(int) 是「返回指针的函数」，int (*f)(int) 才是「函数指针」，括号不能省。",
"note:typedef 能让函数指针可读性好很多：typedef int (*Cmp)(const void*, const void*); 之后直接写 Cmp cmp;。"
],
code:`#include <stdio.h>

// 一维数组：三种写法完全等价
void print_arr(int a[], int n)
{
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\\n");
}

// 二维数组：列数必须写
void print_matrix(int a[][3], int rows)
{
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < 3; j++) printf("%d ", a[i][j]);
        printf("\\n");
    }
}

// 函数指针作参数
int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }
int apply(int (*op)(int, int), int x, int y) { return op(x, y); }

int main(void)
{
    int a[] = {1, 2, 3, 4};
    print_arr(a, 4);

    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    print_matrix(m, 2);

    printf("%d %d\\n", apply(add, 3, 4), apply(mul, 3, 4));

    // 函数指针数组：简易计算器
    int (*ops[2])(int, int) = {add, mul};
    for (int i = 0; i < 2; i++) printf("%d\\n", ops[i](5, 6));
    return 0;
}`,
out:`1 2 3 4 
1 2 3 
4 5 6 
7 12
11
30`,
tips:["void f(int a[10]) 里的 10 没有任何约束力，别指望它做长度检查。",
"int (*f)(int) 和 int *f(int) 差一个括号，含义天差地别。"]},

/* ================= 第 7 章 指针 ================= */
{c:"🎯 第 7 章 指针",
t:"38 指针是什么：地址、取地址与解引用",
d:"指针就是一个存地址的变量。& 取地址，* 顺着地址找值。把这两件事分清，指针就过了一半。",
body:[
"p:内存里每个字节都有编号，这个编号就是**地址**。变量存在于内存中，所以每个变量都有地址。指针变量就是专门用来存地址的变量。",
"h:三个符号，别搞混",
"ul:&x —— 取变量 x 的地址，结果是「指向 x 的指针」|*p —— 解引用，顺着 p 里的地址找到那个变量，可以读也可以写|int *p —— 声明一个「指向 int 的指针」，这里的 * 是类型的一部分，不是解引用",
"p:看 int *p = &x; 这一行：类型是 int*，变量名是 p，值是 x 的地址。p 本身也是一个变量，它也有自己的地址（&p）。",
"h:通过指针改变变量",
"code:int x = 5;\nint *p = &x;\n*p = 100;      // 等价于 x = 100\nprintf(\"%d\", x);   // 100",
"p:这就是「间接访问」：不直接写 x，而是通过「x 的地址」去改它。函数能修改实参、链表能串起来、动态内存能用起来，全靠这个能力。",
"warn:指针必须初始化。int *p; *p = 5; 是往一个随机地址写数据，通常直接崩溃。不确定指向哪就写 int *p = NULL;，用之前判空。",
"note:printf 打印指针用 %p，传 void* 最规范。地址是十六进制，看着像 0x7ffd... 这种一长串就是栈上的地址。"
],
code:`#include <stdio.h>

int main(void)
{
    int x = 5;
    int *p = &x;          // p 存的是 x 的地址

    printf("x 的值   = %d\\n", x);
    printf("x 的地址 = %p\\n", (void *)&x);
    printf("p 的值   = %p\\n", (void *)p);
    printf("p 指向的值 = %d\\n", *p);

    *p = 100;             // 通过指针改 x
    printf("改完后 x = %d\\n", x);

    // 修改指针本身：让它指向别处
    int y = 200;
    p = &y;
    printf("现在 *p = %d\\n", *p);

    // 指针自己的地址
    printf("&p = %p（指针变量也有地址）\\n", (void *)&p);
    return 0;
}`,
out:`x 的值   = 5
x 的地址 = 0x7ffd...
p 的值   = 0x7ffd...
p 指向的值 = 5
改完后 x = 100
现在 *p = 200
&p = 0x7ffd...（指针变量也有地址）`,
tips:["声明里的 * 和解引用时的 * 是两回事：int *p 是类型，*p = 5 是解引用。",
"*p++ 是 *(p++)，不是 (*p)++，指针运算和自增混用时务必加括号。"]},

{t:"39 指针的类型：为什么 int* 和 char* 不能混用",
d:"指针的类型决定了「解引用读几个字节」和「加 1 走多远」。地址本身只是个数字，类型赋予了它含义。",
body:[
"p:所有指针在 64 位系统上都是 8 字节，那为什么还要分 int*、char*、double*？因为类型决定了两件事：",
"ul:解引用时读/写多少字节：int* 读 4 字节，char* 读 1 字节，double* 读 8 字节|算术运算的步长：p + 1 前进 sizeof(*p) 字节",
"p:同一块内存，用 char* 看是 4 个字节，用 int* 看是一个整数：",
"code:int x = 0x41424344;\nchar *c = (char *)&x;\nprintf(\"%c\", c[0]);   // 小端机器上是 'D'（0x44）",
"h:类型不匹配的后果",
"p:把 int* 强行转成 double* 再解引用，会读到 8 字节并按照浮点格式解释，结果毫无意义，还可能因为对齐问题直接崩溃。所以指针转换要么用 void* 中转，要么确保类型真的兼容。",
"h:常见指针类型速查",
"ul:int *p 指向整数|char *s 指向字符/字符串|int **pp 指向「指针」的指针|int (*pa)[4] 指向「含 4 个 int 的数组」|int (*pf)(int) 指向函数",
"note:void* 是「无类型指针」，可以装任何地址，但不能直接解引用（因为不知道该读几字节），必须先转成具体类型。malloc 返回的就是 void*。"
],
code:`#include <stdio.h>

int main(void)
{
    int x = 0x41424344;
    char *c = (char *)&x;

    // 小端序：低字节在前
    printf("按字节看: %c %c %c %c\\n", c[0], c[1], c[2], c[3]);

    // 指针类型决定步长
    int arr[3] = {10, 20, 30};
    int *pi = arr;
    char *pc = (char *)arr;

    printf("pi+1 走 %ld 字节\\n", (long)((char *)(pi + 1) - (char *)pi));  // 4
    printf("pc+1 走 %ld 字节\\n", (long)((pc + 1) - pc));                  // 1
    printf("*(pi+1) = %d\\n", *(pi + 1));

    // void* 可以装任意地址，但不能直接解引用
    void *v = &x;
    printf("void* 转回来: 0x%x\\n", *(int *)v);
    return 0;
}`,
out:`按字节看: D C B A
pi+1 走 4 字节
pc+1 走 1 字节
*(pi+1) = 20
void* 转回来: 0x41424344`,
tips:["小端机器（x86/ARM 常见）上多字节整数是低字节在前，所以 0x41424344 读出来是 D C B A。",
"指针强转后解引用是最容易出未定义行为的地方，非必要不做。"]},

{t:"40 指针运算与数组遍历",
d:"指针加 1 不是地址加 1，而是加一个元素的大小。指针相减得到的是「相隔多少个元素」。",
body:[
"p:指针支持三种运算：加减整数、指针相减、比较。乘除、相加两个指针都是非法的（没有意义）。",
"h:规则",
"ul:p + n 指向「往后第 n 个元素」，地址增加 n * sizeof(*p)|p - n 同理往前|p1 - p2 得到两个指针之间相隔的元素个数（类型是 ptrdiff_t）|p1 < p2 比较的是地址高低，同一数组内才有意义",
"h:用指针遍历数组",
"code:int a[5] = {1,2,3,4,5};\nint *p = a;\nwhile (p < a + 5) {\n    printf(\"%d \", *p);\n    p++;\n}",
"p:这里 a + 5 是「最后一个元素的下一个位置」，C 标准允许指针指向数组末尾后一位（但不能解引用）。这是遍历循环的安全上界写法。",
"h:指针与下标的等价关系",
"code:a[i]  ≡  *(a + i)  ≡  *(i + a)  ≡  i[a]",
"p:最后一种 i[a] 确实合法（因为 + 满足交换律），但千万别这么写——除了炫技没有任何好处。",
"warn:两个不同数组的指针相减是未定义行为，哪怕它们地址相邻。只有指向同一块连续内存的指针做减法才有定义。",
"note:ptrdiff_t 是带符号类型，用 %td 打印。别用 %d，64 位下会截断。"
],
code:`#include <stdio.h>

int main(void)
{
    int a[5] = {10, 20, 30, 40, 50};

    // 指针遍历
    for (int *p = a; p < a + 5; p++)
        printf("%d ", *p);
    printf("\\n");

    // 指针相减 = 元素个数
    int *p1 = &a[0], *p2 = &a[3];
    printf("相隔 %td 个元素\\n", p2 - p1);

    // 下标与指针等价
    printf("%d %d %d %d\\n", a[2], *(a + 2), *(2 + a), 2[a]);

    // 反向遍历
    for (int *p = a + 4; p >= a; p--)
        printf("%d ", *p);
    printf("\\n");

    // 指针比较
    printf("p1 < p2: %d\\n", p1 < p2);
    return 0;
}`,
out:`10 20 30 40 50 
相隔 3 个元素
30 30 30 30
50 40 30 20 10 
p1 < p2: 1`,
tips:["指针相减只能用 %td 或 %ld，用 %d 在 64 位上有隐患。",
"数组越界后指针比较也是未定义行为，别依赖「地址相邻」这种假设。"]},

{t:"41 指针与数组：像，但不是一回事",
d:"a[i] 等价于 *(a+i)，但数组名不是指针：它不能被赋值，sizeof 的结果也不同。",
body:[
"p:数组名在大多数表达式里会**退化**成指向首元素的指针，所以 a[i]、*(a+i) 完全等价。但数组名本身不是指针变量，它没有自己的存储空间。",
"h:三个关键区别",
"ul:a 不能被赋值：a = p 编译错误；指针 p 可以 p = a|sizeof(a) 是整个数组的字节数；sizeof(p) 是指针大小|&a 的类型是「指向整个数组的指针」，&a + 1 会跳过整个数组；&a[0] + 1 只跳过 1 个元素",
"h:什么时候会退化",
"ul:作为函数参数时必然退化|参与算术运算、比较、赋值时退化|sizeof、& 运算时不退化",
"h:二维数组的三种指针",
"p:int a[3][4] 里，a 的类型是「指向含 4 个 int 的数组的指针」，即 int (*)[4]。所以 a + 1 跳过一整行（16 字节），而不是 4 字节。这是理解二维数组指针的关键。",
"code:int a[3][4];\nint (*p)[4] = a;      // 行指针\np++;                  // 前进一行\na[1][2] ≡ *(*(a+1)+2) ≡ p[1][2]",
"note:数组名在 sizeof 里不退化，所以 sizeof(a)/sizeof(a[0]) 只能在数组还在当前作用域时求长度，传进函数就失效了。"
],
code:`#include <stdio.h>

int main(void)
{
    int a[4] = {1, 2, 3, 4};
    int *p = a;

    printf("sizeof(a)=%zu, sizeof(p)=%zu\\n", sizeof(a), sizeof(p));
    printf("a[2]=%d, *(a+2)=%d, *(p+2)=%d\\n", a[2], *(a + 2), *(p + 2));

    // 数组名不可赋值
    // a = p;   // 编译错误：表达式必须是可修改的左值
    p = a + 1;
    printf("p 现在指向 %d\\n", *p);

    // &a 与 &a[0] 的区别
    printf("&a+1 跳过 %ld 字节\\n", (long)((char *)(&a + 1) - (char *)&a));
    printf("&a[0]+1 跳过 %ld 字节\\n", (long)((char *)(&a[0] + 1) - (char *)&a));

    // 二维数组的行指针
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int (*row)[3] = m;
    printf("m[1][2]=%d, row[1][2]=%d\\n", m[1][2], row[1][2]);
    printf("整行大小 %zu\\n", sizeof(*row));
    return 0;
}`,
out:`sizeof(a)=16, sizeof(p)=8
a[2]=3, *(a+2)=3, *(p+2)=3
p 现在指向 2
&a+1 跳过 16 字节
&a[0]+1 跳过 4 字节
m[1][2]=6, row[1][2]=6
整行大小 12`,
tips:["&a 和 a 的数值一样，但类型不同，运算行为就不同——类型决定语义。",
"int *p[4] 是指针数组（4 个指针），int (*p)[4] 是数组指针（1 个指针指向 4 元数组），括号位置决定一切。"]},

{t:"42 二级指针：为什么函数里改指针要传指针的指针",
d:"一级指针能改「值」，二级指针能改「指针本身」。链表头插、动态改字符串、命令行参数表，都靠它。",
body:[
"p:二级指针就是「指向指针的指针」，写法 int **pp。它存的是一个 int* 变量的地址。",
"code:int x = 5;\nint *p = &x;      // 一级：存 x 的地址\nint **pp = &p;    // 二级：存 p 的地址\n**pp = 100;       // 两次解引用，改到 x",
"h:为什么需要它",
"p:函数想修改「调用者的指针变量」，就必须传这个指针的地址——和「想改 int 就传 int 的地址」是同一个逻辑，只是升高了一级。",
"code:void alloc_bad(int *p)  { p = malloc(sizeof(int)); }  // 只改了副本，外面还是空\nvoid alloc_good(int **p) { *p = malloc(sizeof(int)); }  // 改到了外面的指针",
"h:三个典型场景",
"ul:函数内分配内存并返回指针（如上）|链表头插法：需要修改 head 指针本身|main 的 char **argv：指针数组的首地址",
"h:怎么理解多层指针",
"p:从右往左读：int **pp 读作「pp 是指针，指向 int 的指针」。再复杂的写法如 int (*(*f)(int))[4]，也是从内往外一层层拆。实践中超过二级就该用结构体封装了。",
"note:二级指针不是「指向二维数组」的指针，那是 int (*)[N]。这两个经常被混为一谈，实际上内存布局完全不同。"
],
code:`#include <stdio.h>
#include <stdlib.h>

// 错误：只改了形参副本
void alloc_bad(int *p)
{
    p = (int *)malloc(sizeof(int));
    *p = 42;          // 写的是新分配的，外面拿不到
}

// 正确：改的是调用者的指针
void alloc_good(int **p)
{
    *p = (int *)malloc(sizeof(int));
    if (*p) **p = 42;
}

int main(void)
{
    int x = 5;
    int *p = &x;
    int **pp = &p;

    printf("x=%d *p=%d **pp=%d\\n", x, *p, **pp);
    **pp = 100;
    printf("改完 x=%d\\n", x);

    int *a = NULL;
    alloc_bad(a);
    printf("alloc_bad 之后 a 还是 %p\\n", (void *)a);

    alloc_good(&a);
    if (a) {
        printf("alloc_good 之后 a=%p, *a=%d\\n", (void *)a, *a);
        free(a);
    }
    return 0;
}`,
out:`x=5 *p=5 **pp=5
改完 x=100
alloc_bad 之后 a 还是 (nil)
alloc_good 之后 a=0x..., *a=42`,
tips:["函数内 malloc 一定要用返回值或二级指针带出来，否则必然泄漏 + 拿不到。",
"head 指针在链表操作里是整个链表的入口，头插时必须用 Node**。"]},

{t:"43 指针数组与数组指针",
d:"int *p[3] 是三个指针组成的数组；int (*p)[3] 是一个指针，指向三个 int 的数组。括号的位置决定含义。",
body:[
"p:这两个声明长得像，含义完全不同，是 C 语言最经典的「读声明」考题。",
"h:读法：从变量名开始，往右看，遇到括号先看括号里",
"ul:int *p[3] —— p 是数组，3 个元素，每个是 int*|int (*p)[3] —— p 是指针，指向「含 3 个 int 的数组」|int (*p[3])[4] —— p 是数组，3 个元素，每个是指向「4 个 int 数组」的指针",
"h:指针数组的用途",
"ul:字符串表：char *names[] = {\"Tom\", \"Jerry\"}，每个元素指向一个字符串常量|命令行参数：char *argv[]|函数指针数组：做跳转表/状态机",
"h:数组指针的用途",
"p:主要用于二维数组。int (*p)[4] = arr; 之后 p[i][j] 就能正常访问——因为 p + 1 会跳过一整行。如果写成 int *p = (int*)arr，那就退化成一维，需要自己算 i*cols+j。",
"code:int a[2][3] = {{1,2,3},{4,5,6}};\nint (*row)[3] = a;\nprintf(\"%d\", row[1][2]);   // 6",
"note:记忆口诀：方括号优先于星号，所以「先数组后指针」是 int *p[3]；加了括号就强制「先指针后数组」，即 int (*p)[3]。"
],
code:`#include <stdio.h>

int main(void)
{
    // 指针数组：3 个字符串
    const char *names[3] = {"Tom", "Jerry", "Spike"};
    for (int i = 0; i < 3; i++) printf("%s ", names[i]);
    printf("\\n");

    // 指针数组：指向不同变量
    int a = 1, b = 2, c = 3;
    int *ptrs[3] = {&a, &b, &c};
    for (int i = 0; i < 3; i++) printf("%d ", *ptrs[i]);
    printf("\\n");

    // 数组指针：指向一整行
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int (*row)[3] = m;
    printf("row[1][2] = %d\\n", row[1][2]);
    printf("sizeof(*row) = %zu（一整行）\\n", sizeof(*row));
    printf("sizeof(names) = %zu（3 个指针）\\n", sizeof(names));

    // 函数指针数组：跳转表
    printf("&a=%p, ptrs[0]=%p\\n", (void *)&a, (void *)ptrs[0]);
    return 0;
}`,
out:`Tom Jerry Spike 
1 2 3 
row[1][2] = 6
sizeof(*row) = 12（一整行）
sizeof(names) = 24（3 个指针）
&a=0x..., ptrs[0]=0x...`,
tips:["char *names[] 里的字符串是只读常量，别去改；要改就用 char names[][20]。",
"sizeof(names) 得到的是「指针数组」的总大小（3×8=24），不是字符串总长度。"]},

{t:"44 函数指针与回调",
d:"函数名就是函数的地址。把函数当参数传进去，就能实现「同一套流程、不同的策略」，qsort 就是这个套路。",
body:[
"p:函数在编译后就固定在代码段里，函数名本身代表它的入口地址。所以可以有指针指向函数，也可以通过指针调用它。",
"h:声明与使用",
"code:int add(int a, int b) { return a + b; }\nint (*pf)(int, int) = add;   // 声明函数指针并初始化\nint r = pf(1, 2);            // 调用，等价于 (*pf)(1, 2)",
"p:pf(1,2) 和 (*pf)(1,2) 完全等价，前者更常用。注意 int *pf(int, int) 是「返回 int* 的函数」，加括号才是函数指针。",
"h:回调：把行为参数化",
"p:标准库的 qsort 就是典型：它不知道怎么比较你的数据，所以让你把比较函数传进去。",
"code:int cmp(const void *a, const void *b) {\n    return *(const int*)a - *(const int*)b;\n}\nqsort(arr, n, sizeof(int), cmp);",
"h:typedef 让声明可读",
"code:typedef int (*CmpFunc)(const void *, const void *);\nvoid sort(void *base, size_t n, CmpFunc cmp);",
"warn:函数指针为 NULL 时调用会直接崩溃，回调参数要么判空，要么约定必传。",
"note:函数指针数组可以做「跳转表」，比一长串 if-else 或 switch 更快也更清晰，写状态机、命令分发时很常用。"
],
code:`#include <stdio.h>
#include <stdlib.h>

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

// 回调：比较函数
int cmp_asc(const void *a, const void *b)
{
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);       // 避免相减溢出
}

// 把函数指针当参数
int reduce(int *a, int n, int (*op)(int, int), int init)
{
    int acc = init;
    for (int i = 0; i < n; i++) acc = op(acc, a[i]);
    return acc;
}

int main(void)
{
    int (*pf)(int, int) = add;
    printf("%d %d\\n", pf(3, 4), (*pf)(3, 4));

    int a[] = {5, 2, 9, 1};
    printf("sum=%d\\n", reduce(a, 4, add, 0));
    printf("mul=%d\\n", reduce(a, 4, mul, 1));

    qsort(a, 4, sizeof(a[0]), cmp_asc);
    for (int i = 0; i < 4; i++) printf("%d ", a[i]);
    printf("\\n");

    // 函数指针数组：命令表
    int (*ops[])(int, int) = {add, sub, mul};
    const char *names[] = {"add", "sub", "mul"};
    for (int i = 0; i < 3; i++)
        printf("%s(6,2)=%d\\n", names[i], ops[i](6, 2));
    return 0;
}`,
out:`7 7
sum=17
mul=90
1 2 5 9 
add(6,2)=8
sub(6,2)=4
mul(6,2)=12`,
tips:["比较函数返回 (x>y)-(x<y) 这种写法能避免大数相减溢出，是标准做法。",
"qsort 的比较函数参数是 const void*，必须强转成实际类型再比较。"]},

{t:"45 NULL、野指针、悬空指针",
d:"野指针是「没初始化、指向随机地址」；悬空指针是「指向已经被释放的内存」。两者都是崩溃和诡异 bug 的主要来源。",
body:[
"p:这三个概念经常被混用，但成因不同，防法也不同。",
"h:三种「坏指针」",
"ul:野指针：int *p; 未初始化，值是随机的|悬空指针：free(p) 之后 p 还指向那块已释放的内存|空指针解引用：int *p = NULL; *p = 5; 直接崩溃",
"h:三条纪律",
"ul:定义时就初始化：不知道指向哪就写 NULL|free 之后立刻置 NULL：free(p); p = NULL;|使用前判空：if (p != NULL) { ... }",
"h:NULL 到底是什么",
"p:NULL 是一个宏，通常定义为 ((void*)0) 或 0。它是一个明确的「不指向任何有效地址」的标记，解引用它一定会崩——这是好事，比随机崩溃容易查。",
"h:void* 的作用",
"p:void* 是「通用指针」，可以接受任何类型的地址，也可以赋给任何类型指针，不需要强转。它的用途是「传递一块未知类型的内存」，比如 malloc 的返回值、memcpy 的参数。但它不能直接解引用，也不能做算术（GCC 允许，但那不是标准 C）。",
"warn:free 同一块内存两次是未定义行为（double free），常见于清理逻辑重复执行。free(NULL) 是安全的，什么也不做。",
"note:调试这类问题首选 -fsanitize=address，它能在越界/悬空访问发生的那一刻就报错并打印调用栈，比事后 printf 强太多。"
],
code:`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *p = NULL;              // 1. 先初始化
    if (p == NULL) printf("p 是空指针，不能解引用\\n");

    p = (int *)malloc(sizeof(int));
    if (p == NULL) return 1;    // 2. 申请后判空
    *p = 42;
    printf("*p = %d\\n", *p);

    free(p);
    p = NULL;                   // 3. 释放后立刻置空

    // 悬空指针示例（注释掉，否则可能崩溃）
    // int *q = (int *)malloc(sizeof(int));
    // free(q);
    // printf("%d", *q);        // 未定义行为

    // 野指针：未初始化的指针
    // int *bad;
    // *bad = 1;                // 未定义行为，通常直接崩

    void *v = malloc(8);        // void* 接收任意类型
    int *ip = (int *)v;         // 赋给具体类型
    *ip = 7;
    printf("void* 转 int*: %d\\n", *ip);
    free(v);

    free(NULL);                 // 安全，什么也不做
    printf("free(NULL) 不会崩\\n");
    return 0;
}`,
out:`p 是空指针，不能解引用
*p = 42
void* 转 int*: 7
free(NULL) 不会崩`,
tips:["free 之后不置 NULL，是「用了一次还能跑、用两次才崩」的典型隐患，极难复现。",
"把 free 封装成宏（#define FREE(p) do { free(p); (p)=NULL; } while(0)）能强制养成习惯。"]},

{t:"46 const 的三种位置与指针的四种组合",
d:"const int *p、int * const p、const int * const p —— 位置不同，谁不能改也不同。这是面试高频题。",
body:[
"p:const 在指针声明里，关键看 const 在 * 的左边还是右边：",
"ul:const int *p —— 指向的内容不能改，指针本身可以改（指向别处）|int * const p —— 指针本身不能改，指向的内容可以改|const int * const p —— 两者都不能改|int const *p —— 和 const int *p 完全等价（const 修饰的是 int）",
"h:读法技巧",
"p:从变量名往左读，遇到 const 就说「const」，遇到 * 就说「指针指向」。比如 int * const p：p 是 const 指针，指向 int。",
"h:为什么要用 const",
"ul:表达意图：这个函数不会改你的数据|让编译器帮忙检查：不小心写 p[0]=1 会直接报错|允许传字符串常量：char *s = \"abc\" 传给 const char * 是合法的，反过来不行|编译期优化：编译器知道这个值不会变",
"h:函数参数里的 const",
"code:void print_str(const char *s);        // 承诺不改内容\nvoid fill(int * const buf, int n);   // 指针不能改指向（少见但对）\nsize_t strlen(const char *s);        // 标准库原型",
"note:const 变量可以用在需要常量表达式的地方吗？在 C 里不行（C++ 可以）。C 的 case 标签、数组长度必须是真正的常量表达式，用 const int 会报错，得用 #define 或 enum。"
],
code:`#include <stdio.h>

int main(void)
{
    int a = 10, b = 20;

    // 1. 指向的内容不能改
    const int *p1 = &a;
    // *p1 = 100;    // 编译错误
    p1 = &b;         // 可以改指向
    printf("p1 -> %d\\n", *p1);

    // 2. 指针本身不能改
    int * const p2 = &a;
    *p2 = 100;       // 可以改内容
    // p2 = &b;      // 编译错误
    printf("a = %d\\n", a);

    // 3. 都不能改
    const int * const p3 = &b;
    // *p3 = 1;  p3 = &a;   // 都报错
    printf("p3 -> %d\\n", *p3);

    // 4. const 修饰变量
    const int MAX = 100;
    // MAX = 200;    // 编译错误

    // 传常量字符串给 const char*
    const char *msg = "hello";
    printf("%s\\n", msg);
    return 0;
}`,
out:`p1 -> 20
a = 100
p3 -> 20
hello`,
tips:["函数参数尽量加 const，既表明意图，又能接受字符串常量实参。",
"const int n = 5; int a[n]; 在 C 里不是常量表达式（VLA 除外），编译器可能拒绝。"]}
]);

/* C 语言笔记 · 第 8~12 章：结构体 / 内存 / 预处理 / 文件 / 调试 */
window.C_NOTES = (window.C_NOTES || []).concat([

/* ================= 第 8 章 结构体与其他 ================= */
{c:"🏗️ 第 8 章 结构体、枚举与位运算",
t:"47 结构体：把散装数据打包成一个类型",
d:"结构体是 C 里唯一的「自定义复合类型」。有了它，一个学生、一条订单、一个节点才能被当成一个整体传递。",
body:[
"p:结构体把多个不同类型的变量打包在一起，形成一个新的类型。定义方式：",
"code:struct 结构体名 {\n    类型 成员1;\n    类型 成员2;\n};   // 分号不能少",
"h:三种定义位置",
"ul:在函数外定义：整个文件可用（推荐）|在函数内定义：只有该函数可用|定义的同时声明变量：struct {...} a, b;（匿名结构体，难复用，不推荐）",
"h:初始化与访问",
"code:struct Student s = {\"Tom\", 20, 92.5};        // 按顺序\nstruct Student t = {.name = \"Li\", .age = 18};  // 指定成员（C99）\ns.age = 19;                                    // 用 . 访问",
"h:结构体的赋值与比较",
"p:同类型的结构体可以直接赋值（s1 = s2），编译器会整体拷贝。但**不能用 == 比较**，必须逐成员比较——因为结构体里可能有填充字节，内容相同的两个结构体，填充区的垃圾值可能不同。",
"h:结构体作参数",
"p:默认是值传递，会拷贝整个结构体。结构体大时（几百字节以上）开销明显，工程上普遍传指针：void f(const struct Student *s)，加 const 保证不改内容。",
"warn:struct 定义后面的分号是最常漏的语法错误之一，漏了会报「unknown type name」这种看起来毫不相关的错。",
"note:结构体可以嵌套，也可以包含自身类型的指针（链表、树靠这个），但**不能包含自身类型的成员**——那会导致大小无限递归。"
],
code:`#include <stdio.h>
#include <string.h>

struct Student {
    char name[20];
    int age;
    double score;
};

// 传指针，避免整体拷贝
void print_student(const struct Student *s)
{
    printf("%-8s %3d %5.1f\\n", s->name, s->age, s->score);
}

int main(void)
{
    struct Student a = {"Tom", 20, 92.5};
    struct Student b = {.name = "Li", .age = 18, .score = 77.0};

    // 成员访问
    printf("%s %d %.1f\\n", a.name, a.age, a.score);
    print_student(&a);
    print_student(&b);

    // 整体赋值
    struct Student c = a;
    c.age = 21;
    printf("c: %s %d\\n", c.name, c.age);

    // 结构体大小（含填充）
    printf("sizeof = %zu\\n", sizeof(struct Student));
    return 0;
}`,
out:`Tom 20 92.5
Tom       20  92.5
Li        18  77.0
c: Tom 21
sizeof = 32`,
tips:["结构体不能整体比较，s1 == s2 编译错误，要逐成员比或用 memcmp（注意填充字节）。",
"定义末尾的分号别漏，这是新手最常见的语法错误。"]},

{t:"48 结构体数组与结构体指针：-> 从哪来",
d:"一堆结构体用数组装，用指针遍历时写 (*p).name 太啰嗦，于是有了 s->name 这个语法糖。",
body:[
"p:结构体数组就是「每个元素都是结构体」的数组，适合表示一张表：学生名单、商品列表、订单记录。",
"code:struct Student list[100];\nlist[0].age = 20;",
"h:指针访问成员的两种写法",
"code:struct Student *p = &list[0];\n(*p).age = 20;    // 正确但啰嗦\np->age = 20;      // 等价，-> 就是 (*p). 的简写",
"p:注意 *p.age 是错的：. 的优先级高于 *，它会被解析成 *(p.age)，而 p.age 本身就不合法，所以编译器会报错。这就是 -> 存在的理由。",
"h:结构体指针的常见用法",
"ul:链表节点：struct Node { int data; struct Node *next; }|遍历数组：for (struct Student *p = list; p < list + n; p++)|函数参数传地址，避免拷贝|动态分配：struct Student *p = malloc(sizeof *p)",
"h:sizeof 的推荐写法",
"code:malloc(sizeof(struct Student))   // 类型改名后容易忘改\nmalloc(sizeof *p)                // 跟着 p 的类型走，永远对",
"note:结构体数组在内存里是连续存放的，所以可以用指针算术遍历；但如果结构体里有指针成员，那些指针指向的内容并不连续，这是「浅拷贝」问题的根源。"
],
code:`#include <stdio.h>
#include <string.h>

struct Student {
    char name[20];
    int age;
    double score;
};

int main(void)
{
    struct Student list[3] = {
        {"Tom", 20, 92.5},
        {"Li", 18, 77.0},
        {"Wang", 19, 85.5}
    };
    int n = sizeof(list) / sizeof(list[0]);

    // 下标访问
    for (int i = 0; i < n; i++)
        printf("%s %d %.1f\\n", list[i].name, list[i].age, list[i].score);

    // 指针遍历：两种等价写法
    struct Student *p = list;
    for (int i = 0; i < n; i++) {
        printf("%s -> %.1f\\n", (p + i)->name, p[i].score);
    }

    // 找最高分
    struct Student *best = &list[0];
    for (struct Student *q = list + 1; q < list + n; q++)
        if (q->score > best->score) best = q;
    printf("最高分: %s %.1f\\n", best->name, best->score);

    // sizeof *p 的写法
    printf("单个结构体 %zu 字节\\n", sizeof *p);
    return 0;
}`,
out:`Tom 20 92.5
Li 18 77.0
Wang 19 85.5
Tom -> 92.5
Li -> 77.0
Wang -> 85.5
最高分: Tom 92.5
单个结构体 32 字节`,
tips:["-> 左边必须是指针，. 左边必须是结构体变量，混用会编译错误。",
"struct Student *p = list; 这里 list 退化成了首元素地址，类型正好匹配。"]},

{t:"49 内存对齐：为什么 sizeof 比成员加起来大",
d:"编译器为了让 CPU 读得快，会在成员之间塞填充字节。char + int 不是 5 字节，而是 8 字节。",
body:[
"p:先看一个事实：struct { char c; int i; } 的 sizeof 是 8，不是 5。多出来的 3 个字节是**填充（padding）**。",
"h:为什么要对齐",
"p:CPU 访问内存是按「字」来的，32 位机器一次读 4 字节，64 位一次读 8 字节。如果一个 int 横跨两个 4 字节块，CPU 就得读两次再拼接。对齐后一次就能读完，这是用空间换时间。",
"h:对齐规则（以常见平台为例）",
"ul:每个成员的偏移量必须是它自身大小的整数倍|结构体总大小必须是「最大成员大小」的整数倍|char 对齐 1，short 对齐 2，int 对齐 4，double 对齐 8，指针对齐 8（64 位）",
"h:实际算一遍",
"code:struct A { char c; int i; };       // c 占 1，补 3，i 占 4 → 8\nstruct B { int i; char c; };       // i 占 4，c 占 1，补 3 → 8\nstruct C { char a; char b; int i; };// a b 各 1，补 2，i 占 4 → 8",
"p:同样 5 字节的数据，三种排列都是 8 字节。但把 char 都放前面、大的放后面，就能减少填充——这也是「按大小降序排列成员」这个优化建议的由来。",
"h:怎么取消对齐",
"code:#pragma pack(1)   // 强制 1 字节对齐，多用于网络协议、文件格式\nstruct Packet { ... };\n#pragma pack()",
"warn:pack(1) 会让访问变慢，甚至在某些架构（ARM）上直接触发对齐异常。只在解析二进制格式时用，用完立刻恢复。",
"note:offsetof(struct A, i) 宏（stddef.h）能直接打印成员的偏移量，是验证对齐规则的最好工具。"
],
code:`#include <stdio.h>
#include <stddef.h>

struct A { char c; int i; };
struct B { int i; char c; };
struct C { char a; char b; int i; };
struct D { char a; double d; char b; };

#pragma pack(push, 1)
struct Packed { char c; int i; };
#pragma pack(pop)

int main(void)
{
    printf("A: %zu 字节，i 偏移 %zu\\n", sizeof(struct A), offsetof(struct A, i));
    printf("B: %zu 字节，i 偏移 %zu\\n", sizeof(struct B), offsetof(struct B, i));
    printf("C: %zu 字节\\n", sizeof(struct C));
    printf("D: %zu 字节，d 偏移 %zu\\n", sizeof(struct D), offsetof(struct D, d));
    printf("Packed: %zu 字节\\n", sizeof(struct Packed));

    // 成员顺序优化：大的放前面能省空间
    printf("A 与 B 内容相同，大小都是 %zu / %zu\\n",
           sizeof(struct A), sizeof(struct B));
    return 0;
}`,
out:`A: 8 字节，i 偏移 4
B: 8 字节，i 偏移 0
C: 8 字节
D: 24 字节，d 偏移 8
Packed: 5 字节`,
tips:["别用 memcmp 比较含填充字节的结构体，填充区的内容不确定。",
"跨平台传输二进制结构体时，一定要 pack，否则两端布局对不上。"]},

{t:"50 typedef、enum 与 union",
d:"typedef 起别名、enum 给整数常量起名字、union 让多个成员共用一块内存——三个「看起来像语法糖」但各有实用场景的工具。",
body:[
"h:typedef：给类型起别名",
"code:typedef unsigned long long u64;\ntypedef struct Student { char name[20]; int age; } Student;",
"p:结构体配 typedef 之后，就可以直接写 Student s; 而不用每次写 struct Student。注意别名放在**最后**，不是 struct 后面。",
"h:enum：给一组整数起名字",
"code:enum Color { RED, GREEN, BLUE };   // 0 1 2\nenum Status { OK = 200, NOT_FOUND = 404 };",
"p:枚举值默认从 0 开始递增，也可以手动指定。有了它，代码里就不用出现「魔法数字」——把 if (status == 2) 写成 if (status == DONE)，可读性立刻不一样。",
"h:union：所有成员共用同一块内存",
"code:union Data {\n    int i;\n    float f;\n    char bytes[4];\n};",
"p:union 的大小等于最大成员的大小。给 i 赋值会覆盖 f 的内容——因为它们占的是同一块空间。这不是 bug，是特性：常用于「一个变量可能是多种类型」的场景，或者把 float 拆成字节看它的二进制表示。",
"warn:union 里写了 i 再读 f 是未定义行为（类型双关），虽然实际能跑。想安全地看二进制表示，用 memcpy 到 unsigned char 数组。",
"note:enum 本质就是 int，可以做算术、可以越界赋值（C 不做检查），所以别指望它提供类型安全，它只是「可读性工具」。"
],
code:`#include <stdio.h>
#include <string.h>

typedef struct {
    char name[20];
    int age;
} Student;                       // 现在可以直接用 Student

typedef unsigned long long u64;

enum Color { RED, GREEN, BLUE };
enum Status { OK = 200, NOT_FOUND = 404 };

union Data {
    int i;
    float f;
    unsigned char bytes[4];
};

int main(void)
{
    Student s = {"Tom", 20};
    printf("%s %d\\n", s.name, s.age);

    u64 big = 123456789012345ULL;
    printf("%llu\\n", big);

    enum Color c = GREEN;
    printf("GREEN = %d, BLUE = %d\\n", c, BLUE);
    printf("OK = %d, NOT_FOUND = %d\\n", OK, NOT_FOUND);

    union Data d;
    d.f = 1.0f;
    printf("union 里的 1.0f 按字节看:");
    for (int k = 0; k < 4; k++) printf(" %02x", d.bytes[k]);
    printf("\\n");
    printf("union 大小 %zu\\n", sizeof(union Data));
    return 0;
}`,
out:`Tom 20
123456789012345
GREEN = 1, BLUE = 2
OK = 200, NOT_FOUND = 404
union 里的 1.0f 按字节看: 00 00 80 3f
union 大小 4`,
tips:["typedef 的别名要写在分号前、花括号后：typedef struct {...} Name;",
"enum 的值可以重复，也可以跳着写，但别依赖它的具体数值做运算。"]},

{t:"51 位运算：& | ^ ~ << >>",
d:"位运算直接操作二进制位，是「用一行代码代替一堆 if」的工具。判奇偶、置位、清位、交换、乘除 2 的幂，全靠它。",
body:[
"h:六个运算符",
"ul:& 按位与：两位都是 1 才得 1，常用于「取某几位」|\\| 按位或：有一位是 1 就得 1，常用于「置位」|^ 异或：相同为 0 不同为 1，常用于「翻转位」「交换两数」|~ 取反：0 变 1，1 变 0|<< 左移：每移一位相当于乘 2|>> 右移：每移一位相当于除 2（有符号数是算术右移，补符号位）",
"h:四个必会技巧",
"ul:判奇偶：n & 1|清掉最低位的 1：n & (n - 1)，可以用来数「二进制里有多少个 1」|取最低位的 1：n & -n|异或消重：x ^ x = 0，x ^ 0 = x，可用来在一堆数里找唯一出现的那个",
"h:置位 / 清位 / 翻转 / 判断",
"code:flags |= (1 << 3);      // 把第 3 位置 1\nflags &= ~(1 << 3);     // 把第 3 位清 0\nflags ^= (1 << 3);      // 翻转第 3 位\nif (flags & (1 << 3))   // 判断第 3 位是否为 1",
"warn:移位位数不能大于等于类型位宽（int 移 32 位是未定义行为）。左移有符号负数也是 UB，只对无符号类型做移位最安全。",
"note:位运算优先级低于比较运算，写 if (x & 1 == 0) 会被解析成 x & (1==0)，必须加括号 if ((x & 1) == 0)。"
],
code:`#include <stdio.h>

int count_bits(unsigned int n)
{
    int c = 0;
    while (n) { n &= n - 1; c++; }   // 每次消掉最低位的 1
    return c;
}

int main(void)
{
    int n = 6;                        // 110
    printf("n&1 = %d（判奇偶）\\n", n & 1);
    printf("n<<1 = %d（乘 2）\\n", n << 1);
    printf("n>>1 = %d（除 2）\\n", n >> 1);
    printf("~n = %d\\n", ~n);
    printf("5^5 = %d\\n", 5 ^ 5);

    printf("6 的二进制里 1 的个数: %d\\n", count_bits(6));

    // 用位运算做权限标志
    unsigned flags = 0;
    const unsigned READ = 1u << 0, WRITE = 1u << 1, EXEC = 1u << 2;

    flags |= READ | WRITE;            // 设置读写
    printf("可读: %d, 可写: %d, 可执行: %d\\n",
           !!(flags & READ), !!(flags & WRITE), !!(flags & EXEC));

    flags &= ~WRITE;                  // 取消写权限
    printf("取消写后: %d\\n", !!(flags & WRITE));

    // 异或交换（不推荐实际使用，可读性差）
    int a = 3, b = 5;
    a ^= b; b ^= a; a ^= b;
    printf("交换后 a=%d b=%d\\n", a, b);
    return 0;
}`,
out:`n&1 = 0（判奇偶）
n<<1 = 12（乘 2）
n>>1 = 3（除 2）
~n = -7
5^5 = 0
6 的二进制里 1 的个数: 2
可读: 1, 可写: 1, 可执行: 0
取消写后: 0
交换后 a=5 b=3`,
tips:["左移 32 位是未定义行为，移位前先确认位数小于类型宽度。",
"权限标志用 1u << n 而不是 1 << n，避免有符号移位的问题。"]},

{t:"52 位域：用几个 bit 存一个字段",
d:"协议头、硬件寄存器里常出现「这个字段只占 3 位」的需求。位域就是让编译器帮你省这几字节。",
body:[
"p:位域的写法是在结构体成员后面加冒号和位数：",
"code:struct Flags {\n    unsigned int a : 1;   // 占 1 位\n    unsigned int b : 3;   // 占 3 位\n    unsigned int c : 4;   // 占 4 位\n};",
"p:上面这个结构体只占 1 个字节（8 位刚好放下 1+3+4），而不是 12 字节。",
"h:典型用途",
"ul:网络协议头（IP 头里的版本号占 4 位、首部长度占 4 位）|硬件寄存器映射|状态标志打包，省内存",
"h:四条注意事项",
"ul:位域的类型必须是 int / unsigned int / _Bool（C99），不能是 float|不能对位域取地址：&s.a 编译错误（因为不是一个完整字节）|位域宽度不能超过类型的位宽|跨平台的位序（从高到低还是从低到高）由实现决定，所以用位域解析网络包时要注意字节序",
"warn:位域的内存布局在不同的编译器/平台上不完全一致，所以**不要用位域来做需要跨平台传输的数据结构**，改用显式的移位和掩码操作更安全。",
"note:sizeof 位域结构体时，编译器会按底层类型对齐，所以三个 1 位字段可能占 4 字节而不是 1 字节——具体取决于实现和 pack 设置。"
],
code:`#include <stdio.h>

struct Flags {
    unsigned int a : 1;    // 1 位
    unsigned int b : 3;    // 3 位，范围 0~7
    unsigned int c : 4;    // 4 位，范围 0~15
};

struct IPHeader {
    unsigned int version : 4;
    unsigned int ihl     : 4;
};

int main(void)
{
    struct Flags f = {0};
    f.a = 1;
    f.b = 5;
    f.c = 12;
    printf("a=%u b=%u c=%u, sizeof=%zu\\n", f.a, f.b, f.c, sizeof(f));

    // 超出位宽会被截断
    f.b = 9;               // 9 & 0x7 = 1
    printf("b=9 存进去变成 %u\\n", f.b);

    struct IPHeader h = {.version = 4, .ihl = 5};
    printf("version=%u ihl=%u\\n", h.version, h.ihl);

    // 位域不能取地址
    // printf("%p", &f.a);   // 编译错误
    return 0;
}`,
out:`a=1 b=5 c=12, sizeof=4
b=9 存进去变成 1
version=4 ihl=5`,
tips:["位域赋值超出范围会静默截断，不会报错，取值前要自己保证范围。",
"跨平台协议解析别用位域，用移位 + 掩码，行为完全可预测。"]},

/* ================= 第 9 章 内存管理 ================= */
{c:"🧠 第 9 章 内存管理",
t:"53 程序的内存布局：栈、堆、静态区、代码区",
d:"同一个程序的内存分四块，各自的分配方式、生命周期、出错方式都不一样。理解这张图，指针和内存问题就都有了坐标系。",
body:[
"h:从高地址到低地址",
"ul:栈（stack）：局部变量、函数参数、返回地址。自动分配释放，向下增长，大小有限（通常 1~8MB）|堆（heap）：malloc 申请，手动释放，向上增长，空间大但分配慢|未初始化数据段（.bss）：未初始化的全局/静态变量，自动为 0|已初始化数据段（.data）：初始化的全局/静态变量|代码段（.text）：机器指令，只读|常量区（.rodata）：字符串字面量、const 全局，只读",
"h:三条由此推出的结论",
"ul:局部变量函数返回就失效，返回它的地址是错的（悬空指针）|全局变量在程序启动前就已分配好，所以默认是 0|字符串字面量在只读区，char *s = \"abc\"; s[0]='x' 会崩",
"h:栈溢出怎么来的",
"p:栈空间有限。递归太深、函数里定义超大数组（比如 int a[1000000]），都会瞬间耗尽栈空间，程序收到 SIGSEGV 直接崩。大数组要放堆上（malloc）或声明为 static。",
"note:可以用 size 命令或 /proc/self/maps 查看各段地址，也可以打印变量地址对比：栈上的地址很大（0x7ffd...），堆上的地址较小（0x55...），全局变量在更低的位置（0x55... 或 0x0040...）。"
],
code:`#include <stdio.h>
#include <stdlib.h>

int g_init = 10;          // .data 已初始化
int g_zero;               // .bss 未初始化，自动为 0
const char *g_str = "abc";// 指针本身在 .data，字符串在只读区

int main(void)
{
    int local = 1;        // 栈
    static int st = 2;    // .data（静态区）
    int *heap = (int *)malloc(sizeof(int));   // 堆
    if (!heap) return 1;
    *heap = 3;

    printf("代码段（函数地址）: %p\\n", (void *)main);
    printf("只读常量          : %p\\n", (void *)g_str);
    printf("已初始化全局      : %p\\n", (void *)&g_init);
    printf("未初始化全局      : %p\\n", (void *)&g_zero);
    printf("静态局部          : %p\\n", (void *)&st);
    printf("堆                : %p\\n", (void *)heap);
    printf("栈                : %p\\n", (void *)&local);

    printf("g_zero 默认值 = %d\\n", g_zero);
    free(heap);
    return 0;
}`,
out:`代码段（函数地址）: 00007ff6xxxxxxxx
只读常量          : 00007ff6xxxxxxxx
已初始化全局      : 00007ff6xxxxxxxx
未初始化全局      : 00007ff6xxxxxxxx
静态局部          : 00007ff6xxxxxxxx
堆                : 000001xxxxxxxxxx
栈                : 000000xxxxxxxxxx
g_zero 默认值 = 0`,
tips:["函数里别定义巨大数组（如 int buf[1000000]），会直接爆栈，改用 malloc 或 static。",
"局部变量的地址在函数返回后失效，绝不能返回它的地址。"]},

{t:"54 malloc / calloc / realloc / free",
d:"堆内存要自己申请、自己释放、自己判空。四个函数记住一句话：malloc 不初始化，calloc 清零，realloc 调整，free 归还。",
body:[
"h:四个函数",
"ul:void *malloc(size_t size)：申请 size 字节，内容不确定|void *calloc(size_t n, size_t size)：申请 n 个，全部清零|void *realloc(void *p, size_t new_size)：调整已申请块的大小，可能搬家|void free(void *p)：归还，p 必须是 malloc/calloc/realloc 的返回值",
"h:标准使用模板",
"code:int *a = malloc(n * sizeof *a);\nif (a == NULL) { /* 处理失败 */ }\n/* 使用 */\nfree(a);\na = NULL;",
"h:realloc 的两个坑",
"ul:它可能返回新地址（把旧数据搬过去），所以必须用临时变量接：p = realloc(p, n) 在失败时会丢掉原指针，直接内存泄漏|realloc(p, 0) 的行为由实现决定，别依赖",
"h:为什么不用强转",
"p:malloc 返回 void*，C 里可以隐式转成任何指针类型，强转反而会掩盖「忘了 include stdlib.h」的错误（没原型时编译器假设返回 int，强转后就悄悄截断了指针）。",
"warn:申请大小一定要用 sizeof *p 而不是 sizeof(p)——后者是指针大小（8 字节），永远不够。",
"note:malloc(0) 的返回值由实现决定，可能是 NULL 也可能是可 free 的指针，别写这种代码。"
],
code:`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    int n = 5;

    // 1. malloc：不初始化
    int *a = malloc(n * sizeof *a);
    if (!a) return 1;
    for (int i = 0; i < n; i++) a[i] = i * i;
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\\n");

    // 2. calloc：自动清零
    int *b = calloc(n, sizeof *b);
    if (!b) { free(a); return 1; }
    printf("calloc 全为 0: ");
    for (int i = 0; i < n; i++) printf("%d ", b[i]);
    printf("\\n");

    // 3. realloc：扩容，必须用临时变量接
    int *tmp = realloc(a, 8 * sizeof *a);
    if (!tmp) { free(a); free(b); return 1; }
    a = tmp;
    for (int i = n; i < 8; i++) a[i] = i * i;
    printf("扩容后: ");
    for (int i = 0; i < 8; i++) printf("%d ", a[i]);
    printf("\\n");

    // 4. free：成对释放
    free(a);
    free(b);
    a = b = NULL;               // 防悬空
    printf("已全部释放\\n");
    return 0;
}`,
out:`0 1 4 9 16 
calloc 全为 0: 0 0 0 0 0 
扩容后: 0 1 4 9 16 25 36 49 
已全部释放`,
tips:["p = realloc(p, n) 是典型错误：失败时原指针丢了，旧内存再也 free 不掉。",
"sizeof *p 和 sizeof(p) 差一个星号，结果差 8 倍，务必看清。"]},

{t:"55 内存泄漏与五类经典内存错误",
d:"C 没有 GC，申请了不还就是泄漏。泄漏不会立刻报错，只会让程序越跑越慢，最后被系统杀掉。",
body:[
"h:五类经典错误",
"ul:泄漏：malloc 后没有 free，或者指针被覆盖导致再也找不到那块内存|重复释放（double free）：同一块 free 两次，堆管理器直接损坏|释放非堆内存：free 一个栈变量或数组名的地址|越界写：写坏堆块的头部信息，free 时才崩（现场早就过去了）|使用已释放内存（use-after-free）：free 之后又读写，可能读到别人的数据",
"h:泄漏怎么查",
"ul:代码评审时数 malloc 和 free 的配对|Valgrind（Linux）：valgrind --leak-check=full ./app|AddressSanitizer：gcc -fsanitize=address -g，运行即报泄漏位置|自己封装一个带计数器的 alloc/free，跑测试时检查计数是否归零",
"h:所有权约定",
"p:工程上减少内存错误的根本办法是「约定所有权」：谁申请谁释放，或者明确「函数返回的指针由调用者 free」，并写进注释。接口设计时把这条说清楚，比事后调试省一百倍时间。",
"warn:free 之后不置 NULL，是最常见的 use-after-free 成因。养成 free(p); p = NULL; 的习惯，即使后面误用也会立刻崩在明确的位置。",
"note:内存泄漏在短命程序（命令行工具）里通常无所谓——进程退出时操作系统会回收。但在长时间运行的服务里，泄漏是致命的。"
],
code:`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 错误示范 1：指针被覆盖，原内存再也找不到
void leak_example(void)
{
    char *p = malloc(100);
    if (!p) return;
    p = malloc(200);        // 前一块 100 字节泄漏了
    free(p);
}

// 正确示范：先释放再重新赋值，或用临时变量
void no_leak(void)
{
    char *p = malloc(100);
    if (!p) return;
    free(p);
    p = NULL;

    char *q = malloc(200);
    if (q) { free(q); q = NULL; }
}

// 返回堆内存：必须约定「调用者负责 free」
char *make_greeting(const char *name)
{
    size_t len = strlen(name) + 8;
    char *s = malloc(len);
    if (!s) return NULL;
    snprintf(s, len, "Hi, %s!", name);
    return s;
}

int main(void)
{
    leak_example();
    no_leak();

    char *g = make_greeting("Tom");
    if (g) {
        printf("%s\\n", g);
        free(g);
        g = NULL;           // 防 use-after-free
    }
    printf("正常结束\\n");
    return 0;
}`,
out:`Hi, Tom!
正常结束`,
tips:["用 -fsanitize=address 跑一遍测试，泄漏和越界能自动定位到行号。",
"接口文档里写清「返回的指针谁负责释放」，能避免绝大多数跨模块泄漏。"]},

/* ================= 第 10 章 预处理 ================= */
{c:"⚙️ 第 10 章 预处理与多文件",
t:"56 #include：头文件到底装了什么",
d:"头文件不放实现，只放「声明」和「宏」。理解这一点，就理解了 C 的编译模型。",
body:[
"p:#include 是预处理指令，作用非常粗暴：把指定文件的**全部内容原样复制**到这一行所在的位置。它不理解 C 语法，只是文本替换。",
"h:两种写法",
"ul:#include <stdio.h> —— 尖括号，从系统/标准库的搜索路径找|#include \"my.h\" —— 双引号，先找当前目录，找不到再去系统路径",
"h:头文件里该放什么",
"ul:函数声明（原型）|宏定义、类型定义（typedef、struct、enum）|extern 变量声明|头文件保护（#ifndef）|**不该放**：函数实现、变量定义（会造成重复定义）",
"h:标准头文件速查",
"ul:stdio.h 输入输出|stdlib.h malloc/free/atoi/qsort/exit|string.h strlen/strcpy/memcpy|math.h 数学函数（链接要加 -lm）|ctype.h isdigit/toupper|stdbool.h bool/true/false|stdint.h int32_t 等定长类型|limits.h INT_MAX 等|time.h time/clock|assert.h assert",
"h:为什么重复 include 不会报错",
"p:因为标准头文件都带**头文件保护**（#ifndef / #define / #endif），第二次 include 时宏已定义，内容被整个跳过。自己的头文件也必须加，否则多处 include 就会重复定义。",
"note:编译时加 -H（GCC）可以看到所有被 include 的文件，排查「这个声明从哪来的」很有用。"
],
code:`// ---------- math_utils.h ----------
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

#define PI 3.14159265358979

int add(int a, int b);          // 只放声明
int mul(int a, int b);
double circle_area(double r);

#endif

// ---------- math_utils.c ----------
#include "math_utils.h"

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }
double circle_area(double r) { return PI * r * r; }

// ---------- main.c ----------
#include <stdio.h>
#include "math_utils.h"

int main(void)
{
    printf("%d %d\\n", add(2, 3), mul(4, 5));
    printf("%.2f\\n", circle_area(2));
    return 0;
}

// 编译：gcc main.c math_utils.c -o app`,
out:`5 20
12.57`,
tips:["头文件里定义变量（int x;）被多个 .c include 会导致重复定义，正确写法是 extern int x; 加一个 .c 里定义。",
"自带头文件必须写 #ifndef 保护，否则嵌套 include 会炸。"]},

{t:"57 #define：宏替换的威力与陷阱",
d:"宏是纯文本替换，不检查类型、不做运算优先级处理。所以带参数的宏，每个参数和整体都要加括号。",
body:[
"h:两种宏",
"ul:对象式宏：#define PI 3.14159，简单文本替换|函数式宏：#define MAX(a,b) ((a)>(b)?(a):(b))，看起来像函数，实际是展开",
"h:为什么每个括号都不能省",
"code:#define SQUARE(x) x * x\nSQUARE(1 + 2)   →  1 + 2 * 1 + 2  = 5   （错的，期望 9）\n\n#define SQUARE(x) ((x) * (x))\nSQUARE(1 + 2)   →  ((1 + 2) * (1 + 2))  = 9   （正确）",
"p:参数要加括号，整体也要加括号。少一层就可能在复杂表达式里翻车。",
"h:宏的副作用",
"code:#define MAX(a,b) ((a)>(b)?(a):(b))\nint i = 5;\nMAX(i++, 3);   // i++ 被执行了两次！i 变成 7",
"p:这是宏无法避免的问题——参数被替换多次就会求值多次。所以 C99 引入了 inline 函数，能用 inline 就别用宏。",
"h:宏的不可替代之处",
"ul:编译期常量：数组长度、case 标签，必须是宏或 enum|条件编译：#ifdef DEBUG|字符串化（#）和拼接（##）：#define STR(x) #x|跨类型通用：MAX 对 int/double 都有效，而函数要写两遍",
"note:#undef 可以取消宏定义。调试时临时 #define printf(...) 屏蔽输出也是常见技巧。"
],
code:`#include <stdio.h>

#define PI 3.14159
#define SQUARE_BAD(x) x * x
#define SQUARE(x) ((x) * (x))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define STR(x) #x
#define CAT(a, b) a##b

int main(void)
{
    printf("%.5f\\n", PI);
    printf("坏宏: %d\\n", SQUARE_BAD(1 + 2));   // 5
    printf("好宏: %d\\n", SQUARE(1 + 2));       // 9

    printf("MAX: %d\\n", MAX(3, 7));

    // 参数被求值两次的坑
    int i = 5;
    int m = MAX(i++, 3);
    printf("i 变成了 %d（被加了两次）\\n", i);

    // 字符串化与拼接
    printf("%s\\n", STR(hello world));
    int CAT(var, 1) = 42;
    printf("var1 = %d\\n", var1);
    return 0;
}`,
out:`3.14159
坏宏: 5
好宏: 9
MAX: 7
i 变成了 6（被加了两次）
hello world
var1 = 42`,
tips:["带副作用的参数（i++、函数调用）绝对不要传给宏。",
"C99 之后常量用 const 或 enum，比宏更安全（有类型、有作用域）。"]},

{t:"58 条件编译与头文件保护",
d:"同一份代码，靠 #ifdef 编译出不同版本：调试版带日志、发布版不带；Windows 版走一套、Linux 版走另一套。",
body:[
"h:三组指令",
"ul:#if / #elif / #else / #endif —— 按常量表达式选择|#ifdef / #ifndef —— 宏是否定义|#if defined(X) —— 等价于 #ifdef，但可以组合条件",
"h:最常用的场景：头文件保护",
"code:#ifndef MY_HEADER_H\n#define MY_HEADER_H\n/* 内容 */\n#endif",
"p:这叫 include guard。第一次 include 时宏未定义，内容生效并定义宏；第二次 include 时宏已存在，整段跳过。没有它，同一个头文件被间接包含两次就会重复定义。",
"h:调试开关",
"code:#ifdef DEBUG\n    printf(\"x = %d\\n\", x);\n#endif\n// 编译时加 -DDEBUG 就打开日志",
"h:平台适配",
"code:#if defined(_WIN32)\n    #include <windows.h>\n#elif defined(__linux__)\n    #include <unistd.h>\n#endif",
"h:现代替代方案",
"p:#pragma once 现在几乎所有编译器都支持，一行搞定头文件保护，比 ifndef 更简洁。但它不是 C 标准，极端情况下（同一文件通过不同路径 include）可能失效，所以标准库风格仍然用 ifndef。",
"note:#if 后面的表达式必须是编译期常量，不能包含变量，也不能用 sizeof。未定义的标识符在 #if 里会被当成 0。"
],
code:`#include <stdio.h>

#define VERSION 2
// #define DEBUG

int main(void)
{
#if VERSION >= 2
    printf("新版逻辑\\n");
#else
    printf("旧版逻辑\\n");
#endif

#ifdef DEBUG
    printf("[DEBUG] 调试信息\\n");
#else
    printf("发布模式\\n");
#endif

#if defined(_WIN32)
    printf("Windows 平台\\n");
#elif defined(__linux__)
    printf("Linux 平台\\n");
#elif defined(__APPLE__)
    printf("macOS 平台\\n");
#else
    printf("未知平台\\n");
#endif

    // 用 #if 0 注释掉一整段代码（比 /* */ 安全，能嵌套）
#if 0
    printf("这段永远不会编译\\n");
#endif
    return 0;
}`,
out:`新版逻辑
发布模式
Windows 平台`,
tips:["#if 0 用来临时屏蔽代码块，比块注释安全（块注释不能嵌套）。",
"条件编译里不要写有副作用的表达式，它只在预处理阶段求值。"]},

{t:"59 预定义宏与多文件编译",
d:"__FILE__、__LINE__ 这些宏在调试日志里非常好用；多文件编译则是把项目拆开的唯一方式。",
body:[
"h:常用预定义宏",
"ul:__FILE__ 当前文件名（字符串）|__LINE__ 当前行号（整数）|__func__ 当前函数名（C99，字符串）|__DATE__ / __TIME__ 编译日期时间|__STDC__ 是否遵循标准（值 1）|__STDC_VERSION__ 标准版本（C99 是 199901L）",
"p:用它们可以做统一的日志宏：",
"code:#define LOG(fmt, ...) \\\n    printf(\"[%s:%d] \" fmt \"\\n\", __FILE__, __LINE__, ##__VA_ARGS__)",
"h:多文件编译",
"p:大项目必然拆成多个 .c。每个 .c 独立编译成 .o，最后一起链接。声明放头文件，定义放 .c。",
"code:gcc -c main.c -o main.o\ngcc -c math.c -o math.o\ngcc main.o math.o -o app",
"p:或者一步到位：gcc main.c math.c -o app。项目大了就写 Makefile 或 CMake，避免每次手敲。",
"h:一个常见坑",
"p:两个 .c 都定义了同名全局函数或变量，链接时会报 multiple definition。解决办法：函数加 static（限定文件内可见），或者用头文件里 extern 声明 + 单个 .c 里定义。",
"note:__func__ 是变量不是宏，不需要也不能写在 #if 里。"
],
code:`#include <stdio.h>

#define LOG(fmt, ...) \\
    printf("[%s:%d %s] " fmt "\\n", __FILE__, __LINE__, __func__, ##__VA_ARGS__)

void do_work(int x)
{
    LOG("开始处理 x=%d", x);
    if (x < 0) LOG("参数异常");
}

int main(void)
{
    LOG("程序启动");
    do_work(42);
    do_work(-1);
    printf("编译于 %s %s\\n", __DATE__, __TIME__);
    return 0;
}`,
out:`[main.c:14 main] 程序启动
[main.c:8 do_work] 开始处理 x=42
[main.c:8 do_work] 开始处理 x=-1
[main.c:9 do_work] 参数异常
编译于 Nov  4 2026 21:30:00`,
tips:["##__VA_ARGS__ 是 GCC 扩展，用来处理「没有可变参数时会多一个逗号」的问题。",
"链接报 multiple definition 时，先查是不是两个 .c 里定义了同名非 static 函数。"]},

/* ================= 第 11 章 文件操作 ================= */
{c:"📁 第 11 章 文件操作",
t:"60 fopen 与 FILE*：打开文件的六种模式",
d:"文件操作三步：fopen 打开 → 读写 → fclose 关闭。模式选错，数据可能被清空或读不到。",
body:[
"p:C 用 FILE* 表示一个打开的文件，它是一个「文件流」句柄，内部维护着缓冲区、读写位置、错误标志。",
"h:六种模式",
"ul:\"r\" 只读，文件必须存在，否则返回 NULL|\"w\" 只写，文件不存在则创建，**存在则清空**|\"a\" 追加，写入总在末尾，不存在则创建|\"r+\" 读写，文件必须存在|\"w+\" 读写，存在则清空|\"a+\" 读 + 追加",
"p:加 b 表示二进制模式：\"rb\"、\"wb\"。在 Linux/macOS 上文本和二进制没区别，在 Windows 上有区别——文本模式会把 \\n 转成 \\r\\n，二进制模式不转。所以读写二进制数据（图片、结构体）必须加 b。",
"h:标准流程",
"code:FILE *fp = fopen(\"data.txt\", \"r\");\nif (fp == NULL) {\n    perror(\"打开失败\");   // 打印具体错误原因\n    return 1;\n}\n/* 读写 */\nfclose(fp);",
"warn:fopen 失败一定返回 NULL，必须判空。不判空直接 fscanf 会段错误。这是文件操作里最常见的崩溃原因。",
"h:三个流的默认句柄",
"ul:stdin 标准输入（键盘）|stdout 标准输出（屏幕）|stderr 标准错误（屏幕，不带缓冲，专门用于报错）",
"note:perror 会打印「你给的字符串 + 冒号 + 系统错误信息」，比 printf(\"打开失败\") 信息量大得多。"
],
code:`#include <stdio.h>

int main(void)
{
    // 写文件
    FILE *fp = fopen("demo.txt", "w");
    if (fp == NULL) {
        perror("写打开失败");
        return 1;
    }
    fprintf(fp, "line 1\\n");
    fprintf(fp, "line 2\\n");
    fclose(fp);

    // 读文件
    fp = fopen("demo.txt", "r");
    if (fp == NULL) {
        perror("读打开失败");
        return 1;
    }
    char buf[100];
    while (fgets(buf, sizeof buf, fp) != NULL)
        printf("读到: %s", buf);
    fclose(fp);

    // 追加
    fp = fopen("demo.txt", "a");
    if (fp) {
        fprintf(fp, "line 3\\n");
        fclose(fp);
    }

    // 打开不存在的文件
    FILE *bad = fopen("no_such_file.txt", "r");
    if (bad == NULL) {
        printf("确认：文件不存在时 fopen 返回 NULL\\n");
        perror("原因");
    }
    return 0;
}`,
out:`读到: line 1
读到: line 2
确认：文件不存在时 fopen 返回 NULL
原因: No such file or directory`,
tips:["\"w\" 会清空已有文件，想保留原内容用 \"a\"。",
"文件用完必须 fclose，否则缓冲区数据可能没写进磁盘，还会耗尽文件句柄。"]},

{t:"61 文本读写：fprintf / fscanf / fgets / fputs",
d:"文本文件是给人看的，写入时会做格式化转换。四组函数按「格式化」和「整行」分成两类。",
body:[
"h:格式化读写",
"ul:fprintf(fp, \"%d %s\\n\", n, name) —— 按格式写|fscanf(fp, \"%d %s\", &n, name) —— 按格式读，注意 & 和返回值",
"p:fscanf 的返回值和 scanf 一样，是成功匹配的项数。循环读取时要靠它判断结束：",
"code:while (fscanf(fp, \"%d\", &n) == 1) { /* 处理 */ }",
"h:整行读写",
"ul:fgets(buf, size, fp) —— 读一行（含换行），最多 size-1 个字符，安全|fputs(str, fp) —— 写字符串，不加换行|gets / puts 是标准输入输出的版本，gets 已废弃",
"h:哪个更好",
"p:解析结构化数据用 fscanf，但要小心格式串不匹配导致死循环；处理「一行一条记录」的文本用 fgets + sscanf 更稳，因为一次读走一整行，不会留下残余字符。",
"h:两个细节",
"ul:fgets 会把 \\n 一起读进来，通常要手动去掉：buf[strcspn(buf, \"\\n\")] = 0|fscanf 的 %s 遇到空白就停，读不了带空格的字符串",
"note:fgets 返回 NULL 表示读到文件末尾或出错，要用 feof / ferror 区分，但在循环里直接判断返回值就够了。"
],
code:`#include <stdio.h>
#include <string.h>

int main(void)
{
    // 写：格式化
    FILE *fp = fopen("scores.txt", "w");
    if (!fp) { perror("写失败"); return 1; }
    fprintf(fp, "%s %d\\n", "Tom", 92);
    fprintf(fp, "%s %d\\n", "Li", 78);
    fclose(fp);

    // 读：按格式（返回成功项数）
    fp = fopen("scores.txt", "r");
    if (!fp) { perror("读失败"); return 1; }
    char name[32];
    int score, total = 0, cnt = 0;
    while (fscanf(fp, "%31s %d", name, &score) == 2) {
        printf("%-5s %3d\\n", name, score);
        total += score;
        cnt++;
    }
    fclose(fp);
    printf("平均 %.1f\\n", cnt ? (double)total / cnt : 0.0);

    // 读：整行（更稳）
    fp = fopen("scores.txt", "r");
    if (fp) {
        char line[128];
        while (fgets(line, sizeof line, fp)) {
            line[strcspn(line, "\\n")] = '\\0';   // 去掉换行
            printf("[%s]\\n", line);
        }
        fclose(fp);
    }
    return 0;
}`,
out:`Tom    92
Li     78
平均 85.0
[Tom 92]
[Li 78]`,
tips:["fscanf 读 %s 时一定要限宽（%31s），否则和 scanf 一样会溢出。",
"fgets 的 size 参数要用 sizeof buf，别写死数字。"]},

{t:"62 二进制读写：fread / fwrite",
d:"二进制模式原样搬运内存，不做任何转换。速度快、体积小，但换平台可能读不了（字节序、对齐）。",
body:[
"p:fread 和 fwrite 按「块」读写，参数都是四个：缓冲区、单块大小、块数、文件指针。返回值是**成功读写的块数**。",
"code:size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *fp);\nsize_t fread(void *ptr, size_t size, size_t nmemb, FILE *fp);",
"h:典型用法",
"code:struct Student s = {\"Tom\", 20, 92.5};\nfwrite(&s, sizeof s, 1, fp);            // 写一个结构体\nfread(&s, sizeof s, 1, fp);             // 读一个",
"h:数组批量读写",
"code:int a[100];\nfwrite(a, sizeof a[0], n, fp);   // 写 n 个 int\nfread(a, sizeof a[0], n, fp);    // 读 n 个 int",
"h:文本 vs 二进制的选择",
"ul:二进制：快、省空间、适合程序内部数据（存档、缓存）|文本：可读、可编辑、跨平台、适合配置和交换数据|二进制结构体：**不能跨平台**——字节序、对齐、int 大小都可能不同",
"h:怎么知道读到末尾",
"p:用返回值判断：fread 返回的块数小于请求数，说明读到末尾或出错。不要用 feof 提前判断（它只有在读失败之后才为真，会导致多读一次）。",
"warn:写二进制文件时，文件里存的是内存的原始字节。如果结构体里有指针（比如 char *name），存进去的是地址，换个进程读出来就是无效指针。二进制存档要存定长数组，或者自己做序列化。",
"note:文件大小 = 记录数 × sizeof(结构体)。用 fseek(fp, 0, SEEK_END) + ftell(fp) 可以快速算出来。"
],
code:`#include <stdio.h>
#include <string.h>

typedef struct {
    char name[20];
    int age;
    double score;
} Student;

int main(void)
{
    Student list[2] = {{"Tom", 20, 92.5}, {"Li", 18, 77.0}};

    // 写二进制
    FILE *fp = fopen("students.dat", "wb");
    if (!fp) { perror("写失败"); return 1; }
    size_t w = fwrite(list, sizeof(Student), 2, fp);
    printf("写入 %zu 条\\n", w);
    fclose(fp);

    // 读二进制
    fp = fopen("students.dat", "rb");
    if (!fp) { perror("读失败"); return 1; }

    Student buf[10];
    size_t n = fread(buf, sizeof(Student), 10, fp);   // 返回实际读到的条数
    printf("读到 %zu 条\\n", n);
    for (size_t i = 0; i < n; i++)
        printf("%s %d %.1f\\n", buf[i].name, buf[i].age, buf[i].score);

    // 文件大小
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    printf("文件大小 %ld 字节 = %zu × %zu\\n",
           size, n, sizeof(Student));
    fclose(fp);
    return 0;
}`,
out:`写入 2 条
读到 2 条
Tom 20 92.5
Li 18 77.0
文件大小 64 字节 = 2 × 32`,
tips:["fread 的返回值是块数不是字节数，判断读到多少条要用它。",
"结构体里有指针时不能直接 fwrite，存进去的是地址，读出来无效。"]},

{t:"63 文件定位：fseek / ftell / rewind",
d:"文件流内部有一个「读写位置指针」。fseek 移动它，ftell 报告它，rewind 归零。随机访问文件全靠这三个。",
body:[
"h:三个函数",
"ul:long ftell(FILE *fp) —— 返回当前位置距文件开头的字节数|int fseek(FILE *fp, long offset, int whence) —— 移动位置|void rewind(FILE *fp) —— 回到开头，等价于 fseek(fp, 0, SEEK_SET) 并清除错误标志",
"h:whence 的三种取值",
"ul:SEEK_SET 从文件开头算|SEEK_CUR 从当前位置算|SEEK_END 从文件末尾算（此时 offset 通常是负数）",
"h:典型用法",
"code:fseek(fp, 0, SEEK_END);\nlong size = ftell(fp);       // 求文件大小\nfseek(fp, 0, SEEK_SET);      // 回到开头\n\nfseek(fp, n * sizeof(Record), SEEK_SET);  // 直接跳到第 n 条记录\nfread(&rec, sizeof rec, 1, fp);",
"h:注意",
"ul:fseek 只对**二进制模式**支持任意偏移；文本模式下 offset 只能是 ftell 返回过的值（因为换行转换会让字节数对不上）|fseek 之后必须检查返回值，失败返回非 0|越界定位不会报错，但后面的读会失败",
"warn:fseek(fp, 0, SEEK_END) 之后一定要 fseek 回开头再读，否则直接读到末尾，fread 立即返回 0——这是「读出来是空的」最常见原因。",
"note:大于 2GB 的文件要用 fseeko / ftello（POSIX），long 在 32 位平台上装不下。"
],
code:`#include <stdio.h>

typedef struct {
    int id;
    char name[16];
} Record;

int main(void)
{
    Record recs[3] = {{1, "Tom"}, {2, "Li"}, {3, "Wang"}};

    FILE *fp = fopen("records.dat", "wb+");   // wb+ 可读写
    if (!fp) { perror("open"); return 1; }
    fwrite(recs, sizeof(Record), 3, fp);

    // 求文件大小
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    printf("文件大小 %ld 字节，每条 %zu 字节\\n", size, sizeof(Record));

    // 直接跳到第 3 条（下标 2）读取
    fseek(fp, 2 * (long)sizeof(Record), SEEK_SET);
    Record r;
    if (fread(&r, sizeof r, 1, fp) == 1)
        printf("第 3 条: id=%d name=%s\\n", r.id, r.name);

    // 回到开头重新读
    rewind(fp);
    while (fread(&r, sizeof r, 1, fp) == 1)
        printf("%d:%s ", r.id, r.name);
    printf("\\n");
    fclose(fp);
    return 0;
}`,
out:`文件大小 60 字节，每条 20 字节
第 3 条: id=3 name=Wang
1:Tom 2:Li 3:Wang `,
tips:["文本模式下 fseek 的偏移量不可靠（\\r\\n 转换），要做随机访问就用二进制模式。",
"wb+ 是「清空并可读写」，想在保留内容的基础上读写用 rb+。"]},

/* ================= 第 12 章 调试与工程 ================= */
{c:"🛠️ 第 12 章 调试、工程与实战",
t:"64 编译警告与常见错误信息对照表",
d:"编译器报错不是在骂你，是在给你线索。认识这几类高频报错，排错速度能快十倍。",
body:[
"h:先开警告",
"code:gcc -Wall -Wextra -g -std=c11 main.c -o app",
"p:-Wall 打开常用警告，-Wextra 再补一批，-g 带调试信息。很多「运行时才炸」的问题，加警告后在编译期就被拦下了。",
"h:高频报错对照",
"ul:expected ';' before '}' token → 上一行漏了分号|undefined reference to 'foo' → 函数声明了但没实现，或者没把对应 .c 一起编译|implicit declaration of function 'printf' → 忘了 #include <stdio.h>|stray '\\357' in program → 代码里有中文全角符号（引号、分号、括号）|segmentation fault → 空指针/野指针/越界，用 gdb 或 ASan 定位|lvalue required as left operand of assignment → 对常量或表达式赋值，比如 5 = x|warning: control reaches end of non-void function → 有分支没 return",
"h:警告也要当错误看",
"p:warning: unused variable 说明有变量定义了没用，往往是逻辑写漏了；warning: comparison between signed and unsigned 说明可能出现负数变正数的比较错误。工程上常用 -Werror 把所有警告升级成错误，强制清理干净。",
"h:排查顺序",
"ul:从**第一条**错误开始改，后面的错误常常是它的连锁反应|看行号，但真正的问题可能在上一行|把报错信息完整读一遍，gcc 的提示通常已经把原因写清楚了",
"note:遇到看不懂的报错，把关键那句话直接搜，十有八九能搜到同样的问题——报错信息是全世界程序员共享的语料。"
],
code:`// 下面每一行都是一个典型错误，取消注释可以观察报错

#include <stdio.h>

int add(int a, int b);       // 只声明，没定义 → 链接错误

int main(void)
{
    int x = 1
    printf("%d\\n", x);      // 上一行漏分号 → expected ';'

    // printf("%d", 5 = x);  // lvalue required
    // int *p = NULL; *p = 1; // 运行时段错误

    printf("%d\\n", add(1, 2));   // undefined reference to 'add'
    return 0;
}`,
out:`编译时报错：
main.c:9:5: error: expected ',' or ';' before 'printf'
（先修这一条，后面的错误往往会一起消失）`,
tips:["改完第一处错误立刻重新编译，不要一次改十处——会引入新问题。",
"把 -Wall -Wextra 写进 Makefile 或编译脚本，别靠记忆手敲。"]},

{t:"65 gdb：让程序停下来给你看",
d:"printf 能解决 80% 的问题，剩下 20% 得靠调试器：断点、单步、看变量、看调用栈。",
body:[
"h:准备",
"code:gcc -g -O0 main.c -o app   // -g 带调试信息，-O0 关优化（否则变量可能被优化掉）",
"h:常用命令",
"ul:gdb ./app 启动|break main 或 b 12 在函数/行号处下断点|run 或 r 开始运行|next 或 n 单步（不进入函数）|step 或 s 单步（进入函数）|print x 或 p x 打印变量|p *p 打印指针指向的值|bt 查看调用栈（崩在哪一行、谁调的）|info locals 看所有局部变量|continue 或 c 继续到下一个断点|quit 退出",
"h:崩溃后怎么查",
"p:程序段错误后，在 gdb 里 run，崩的时候直接 bt，就能看到完整的调用链，定位到具体哪一行。这比在代码里到处插 printf 快得多。",
"h:三个进阶技巧",
"ul:条件断点：b 12 if i == 50，只在满足条件时停下|watch x：变量被修改时自动停下，专治「这个值谁改的」|layout src：分屏显示源码（需要终端支持）",
"note:gdb 里回车键会重复上一条命令，单步调试时非常方便。Visual Studio Code 配好 launch.json 后可以用图形界面打断点，本质也是调 gdb。"
],
code:`// 待调试的程序：find_max 有 bug
#include <stdio.h>

int find_max(int *a, int n)
{
    int max = a[0];
    for (int i = 1; i <= n; i++) {     // 这里应该是 i < n，越界了
        if (a[i] > max) max = a[i];
    }
    return max;
}

int main(void)
{
    int a[5] = {3, 9, 2, 7, 5};
    printf("max = %d\\n", find_max(a, 5));
    return 0;
}

/* 调试过程：
   $ gcc -g -O0 bug.c -o bug
   $ gdb ./bug
   (gdb) b find_max
   (gdb) run
   (gdb) n            // 单步
   (gdb) p i          // 观察 i 的变化
   (gdb) p n          // 发现 i 可以等于 n → 越界
   (gdb) bt           // 崩溃时看调用栈
*/`,
out:`$ gdb ./bug
(gdb) run
max = 9          ← 这次碰巧对，越界读到的值没影响结果
(gdb) p i
$1 = 5           ← i 等于 n，a[5] 已经越界`,
tips:["-O2 会把变量优化掉，调试时用 -O0 -g，发布时再开优化。",
"bt 是排查崩溃最有效的命令，先看调用栈再看变量。"]},

{t:"66 综合实战：学生成绩管理（结构体 + 文件 + 排序）",
d:"把数组、结构体、函数、排序、文件读写串成一个能跑的小系统。这是「学完 C 语言」的标准验收项目。",
body:[
"p:需求很简单：录入若干学生成绩，按分数排序输出，保存到文件，下次启动能读回来。麻雀虽小，五章的知识点全在里面。",
"h:设计思路",
"ul:数据用 struct Student 表示，全部学生放在一个数组里|功能拆成函数：add / sort / save / load / print|排序用 qsort + 自定义比较函数（分数降序，同分按名字）|持久化用二进制读写，一条记录一个结构体|用固定大小的数组（简单可靠），真实项目再换成动态数组",
"h:几个工程细节",
"ul:所有函数都接收「数组 + 长度」，不依赖全局变量|读写文件都检查返回值，失败给出明确提示|字符串拷贝用 snprintf 限长，防止溢出|排序比较函数返回 int，用 (a>b)-(a<b) 避免溢出",
"h:还能怎么扩展",
"p:换成动态数组支持任意人数、增加删除修改、按科目分开统计、导出 CSV、加菜单循环。每加一个功能，都会逼你重新想清楚数据结构和接口——这才是真正学会 C 的方式。",
"note:这个项目的代码建议自己先写一遍再看答案。看懂了和写出来，中间隔着一整条鸿沟。"
],
code:`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STU 100
#define FILE_NAME "students.dat"

typedef struct {
    char name[32];
    int score;
} Student;

static int cmp_score(const void *a, const void *b)
{
    const Student *x = (const Student *)a;
    const Student *y = (const Student *)b;
    if (x->score != y->score) return (y->score > x->score) - (y->score < x->score);
    return strcmp(x->name, y->name);
}

int add_student(Student *list, int n, const char *name, int score)
{
    if (n >= MAX_STU) return n;
    snprintf(list[n].name, sizeof list[n].name, "%s", name);
    list[n].score = score;
    return n + 1;
}

int save(const Student *list, int n)
{
    FILE *fp = fopen(FILE_NAME, "wb");
    if (!fp) return 0;
    size_t w = fwrite(list, sizeof(Student), (size_t)n, fp);
    fclose(fp);
    return w == (size_t)n;
}

int load(Student *list, int max)
{
    FILE *fp = fopen(FILE_NAME, "rb");
    if (!fp) return 0;
    int n = (int)fread(list, sizeof(Student), (size_t)max, fp);
    fclose(fp);
    return n;
}

void print(const Student *list, int n)
{
    printf("%-10s %5s\\n", "姓名", "分数");
    for (int i = 0; i < n; i++)
        printf("%-10s %5d\\n", list[i].name, list[i].score);
}

int main(void)
{
    Student list[MAX_STU];
    int n = load(list, MAX_STU);

    if (n == 0) {
        printf("没有存档，录入示例数据\\n");
        n = add_student(list, n, "Tom", 92);
        n = add_student(list, n, "Li", 78);
        n = add_student(list, n, "Wang", 88);
        n = add_student(list, n, "Zhao", 66);
        if (!save(list, n)) printf("保存失败\\n");
    } else {
        printf("从文件读回 %d 条记录\\n", n);
    }

    qsort(list, (size_t)n, sizeof(Student), cmp_score);
    print(list, n);

    int sum = 0;
    for (int i = 0; i < n; i++) sum += list[i].score;
    printf("平均分 %.1f，最高分 %d\\n",
           n ? (double)sum / n : 0.0, n ? list[0].score : 0);
    return 0;
}`,
out:`没有存档，录入示例数据
姓名     分数
Tom           92
Wang          88
Li            78
Zhao          66
平均分 81.0，最高分 92`,
tips:["文件名用宏定义，方便以后统一改。",
"读写文件都要判返回值，不然失败了程序还在傻跑，问题很难发现。",
"%-10s 是按字节补空格的，一个汉字占 3 字节，所以表头「姓名」看起来会比下面少两格 —— 中文表格想要对齐，得自己按显示宽度算或干脆用制表符。",
"再运行一次会打印「从文件读回 4 条记录」——二进制文件不带格式自描述，改了结构体字段就必须换文件名或加版本号，否则 fread 回来全是乱码。"]}
]);
