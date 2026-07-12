# CHƯƠNG 1 GIỚI THIỆU ĐỀ TÀI

## 1.1 Tên đề tài

**Xây dựng hệ thống giám sát thiết bị IoT thời gian thực, tích hợp cảnh báo thông minh**

## 1.2 Giới thiệu chung

Internet vạn vật (Internet of Things, IoT) đang trở thành xương sống của nhiều hệ thống tự động hóa, giám sát môi trường và quản lý tài sản. Thực tế triển khai đòi hỏi không chỉ thu thập dữ liệu từ cảm biến mà còn phải tổ chức lưu trữ, truy vấn và hiển thị kịp thời cho người vận hành, đồng thời có cơ chế cảnh báo khi thông số vượt ngưỡng để giảm thiểu rủi ro và thời gian phản ứng.

Đề tài được thể hiện qua mã nguồn và tài liệu của dự án **IoT Device Platform** trong kho lưu trữ hiện tại. Hệ thống được thiết kế theo hướng end-to-end: thiết bị (hoặc script giả lập) gửi dữ liệu đo đạc (telemetry) lên máy chủ ứng dụng; máy chủ chuẩn hóa và lưu trữ dữ liệu, đồng thời đánh giá các luật cảnh báo theo cấu hình; giao diện web cho phép người dùng theo dõi tổng quan, chi tiết từng thiết bị, thống kê theo metric và tra cứu lịch sử cảnh báo. Như vậy, đề tài gắn liền với một nền tảng giám sát thời gian thực (theo nghĩa dữ liệu được tiếp nhận và xử lý ngay khi thiết bị gửi lên, kết hợp hiển thị cập nhật theo thao tác người dùng trên ứng dụng web) và tích hợp kênh thông báo bên ngoài (Telegram) cùng cơ chế giảm trùng lặp tin nhắn.

## 1.3 Mục tiêu của đề tài

Mục tiêu tổng quát của đề tài là xây dựng và mô tả một hệ thống giám sát thiết bị IoT có khả năng vận hành thống nhất từ lớp thiết bị đến lớp giao diện, đáp ứng các yêu cầu nghiệp vụ đã được cài đặt trong mã nguồn. Cụ thể, hướng đến các mục tiêu sau:

- **Thu thập và lưu trữ telemetry**: Cho phép thiết bị xác thực bằng token và gửi bản ghi telemetry; hệ thống chuẩn hóa dữ liệu và ghi vào cơ sở dữ liệu quan hệ.
- **Truy vấn và thống kê**: Cung cấp API để lấy lịch sử telemetry, bản ghi mới nhất và thống kê (trung bình, cực đại, cực tiểu) theo từng metric phục vụ biểu đồ và báo cáo nhanh.
- **Quản trị thiết bị và phân quyền truy cập**: Hỗ trợ chủ sở hữu thiết bị quản lý thiết bị, thuộc tính (attributes) và danh sách người xem (viewers); xác thực người dùng bằng JWT cho các thao tác trên giao diện web.
- **Cảnh báo theo luật cấu hình**: Cho phép định nghĩa luật cảnh báo theo tên metric, điều kiện so sánh và ngưỡng; sau mỗi lần ghi telemetry, hệ thống đánh giá luật, gửi thông báo qua Telegram khi cần và ghi lịch sử cảnh báo, kèm cơ chế hạn chế gửi trùng và nhắc lại theo thời gian chờ (cooldown).

## 1.4 Đối tượng sử dụng

Theo chức năng đã triển khai trong ứng dụng, các đối tượng sử dụng chính gồm:

- **Người dùng đăng ký hệ thống**: Có thể đăng nhập vào ứng dụng web, tạo và quản lý danh sách thiết bị thuộc quyền sở hữu, cấu hình thuộc tính thiết bị, thêm hoặc gỡ người xem, xem dashboard tổng quan, theo dõi telemetry và cảnh báo.
- **Người xem thiết bị (viewer)**: Được chủ sở hữu cấp quyền xem thiết bị; có thể truy cập thông tin và dữ liệu giám sát theo phạm vi quyền mà backend cho phép (phân quyền được thể hiện qua các dependency và service trong mã nguồn).
- **Thiết bị IoT hoặc chương trình gửi dữ liệu**: Đóng vai trò client gọi API telemetry với header `x-device-token` tương ứng thiết bị; trong kho mã còn có thư mục `fake_devices` với các script Python mô phỏng luồng gửi dữ liệu phục vụ kiểm thử và minh họa.

## 1.5 Phạm vi và chức năng chính của hệ thống

**Phạm vi đề tài** bao gồm ba khối chính được mô tả trong tài liệu dự án và có mã nguồn tương ứng: (1) backend REST API phát triển bằng FastAPI; (2) ứng dụng web dashboard phát triển bằng React và Vite; (3) script giả lập thiết bị bằng Python. Cơ sở dữ liệu sử dụng PostgreSQL thông qua SQLAlchemy và driver `psycopg2-binary`. Phạm vi **không** bao gồm các hạng mục chỉ được liệt kê là hướng phát triển trong README (ví dụ Docker Compose một lệnh, Alembic migration, hàng đợi retry Telegram), trừ khi đã được bổ sung trong mã nguồn sau này.

**Chức năng chính** được căn cứ trực tiếp vào README và cấu trúc API trong dự án:

| Nhóm chức năng | Nội dung cốt lõi |
|----------------|------------------|
| Xác thực người dùng | Đăng ký, đăng nhập; cấp JWT access token cho frontend gọi API. |
| Quản lý thiết bị | Tạo, liệt kê, xem chi tiết, xóa thiết bị (xóa theo quyền owner). |
| Telemetry | Thiết bị gửi telemetry qua `POST /telemetry/`; người dùng có quyền truy vấn lịch sử, bản ghi mới nhất, thống kê theo metric. |
| Thuộc tính và người xem | Thêm, liệt kê, xóa thuộc tính thiết bị; quản lý danh sách viewer. |
| Cảnh báo | Tạo và cập nhật luật cảnh báo theo metric, điều kiện, ngưỡng; gửi tin qua Telegram; lưu lịch sử cảnh báo; giảm spam bằng chuyển trạng thái và cooldown. |
| Giao diện web | Dashboard tổng quan; danh sách và chi tiết thiết bị (biểu đồ, bảng, thống kê); trang cảnh báo và lịch sử. |

Luồng xử lý tiêu biểu: thiết bị gửi telemetry → backend xác thực token → chuẩn hóa và lưu DB → kiểm tra luật cảnh báo, gửi Telegram và ghi `alert_history` khi thỏa điều kiện → người dùng quan sát qua frontend gọi các API thiết bị, telemetry và cảnh báo.

## 1.6 Công nghệ và công cụ sử dụng

Phần này tổng hợp công nghệ ghi nhận trong `README.md`, `backend/requirements.txt` và `frontend/package.json` của dự án.

**Phía máy chủ (backend)**

- **Ngôn ngữ và runtime**: Python (README khuyến nghị Python 3.10 trở lên).
- **Framework web**: FastAPI, chạy bằng ASGI server **Uvicorn**.
- **Cơ sở dữ liệu**: PostgreSQL; truy cập qua **SQLAlchemy** và driver **psycopg2-binary**.
- **Mô hình dữ liệu và cấu hình**: **Pydantic** cùng **pydantic-settings** để validate schema và đọc biến môi trường; **python-dotenv** hỗ trợ tải file `.env`.
- **Bảo mật và tích hợp**: Xác thực JWT (module tiện ích trong `app/utils`); gửi thông báo Telegram qua HTTP bằng thư viện **httpx** (theo `requirements.txt`).
- **Khởi tạo schema**: Ứng dụng gọi `Base.metadata.create_all` khi khởi động (chưa dùng công cụ migration như Alembic trong phiên bản hiện tại).

**Phía máy khách web (frontend)**

- **Thư viện giao diện**: **React** (phiên bản 19 theo `package.json`) và **react-dom**.
- **Định tuyến**: **react-router-dom**.
- **Gọi API**: **axios**.
- **Trực quan hóa dữ liệu**: **Recharts** cho biểu đồ telemetry.
- **Giao diện và kiểu**: **Tailwind CSS** (phiên bản 4.x) kết hợp plugin Vite `@tailwindcss/vite`; các gói hỗ trợ build như **PostCSS**, **Autoprefixer**.
- **Công cụ phát triển**: **Vite** làm bundler và dev server; **ESLint** với cấu hình cho React; mã nguồn giao diện sử dụng **JavaScript** và JSX (`.jsx`).

**Mô phỏng thiết bị và môi trường vận hành**

- Script Python trong thư mục `fake_devices` gửi dữ liệu giả lập tới API telemetry.
- **Node.js** và **npm** dùng để cài đặt và chạy frontend (`npm run dev`); **pip** và môi trường ảo Python dùng cho backend và script giả lập.

Việc lựa chọn các công nghệ trên phù hợp với mục tiêu xây dựng API hiệu năng, typing rõ ràng (Pydantic), giao diện tách biệt (SPA React) và trực quan hóa dữ liệu series thời gian cho bài toán giám sát IoT.

# CHƯƠNG 2 KHẢO SÁT NHU CẦU VÀ PHÂN TÍCH TÍNH KHẢ THI

## 2.1 Khảo sát thực tế

Trong các hệ thống vận hành có gắn cảm biến (nhiệt độ, độ ẩm, năng lượng, trạng thái thiết bị…), dữ liệu thường được sinh liên tục theo thời gian và cần được quan sát trong bối cảnh có nhiều thiết bị phân tán. Bài toán giám sát thiết bị IoT không chỉ là “có dữ liệu” mà còn là tổ chức luồng dữ liệu từ thiết bị về máy chủ, lưu trữ có cấu trúc để tra cứu sau này, và cung cấp giao diện giúp người phụ trách nắm được tình trạng hệ thống mà không phải đọc trực tiếp từ từng thiết bị. Dự án **IoT Device Platform** đặt mình trong bối cảnh đó: tập trung vào luồng telemetry được gửi qua API, hiển thị trên dashboard web và kết hợp cảnh báo khi thông số vượt ngưỡng theo luật do người dùng cấu hình.

Việc giám sát thủ công—ví dụ chỉ ghi nhận bằng bảng biểu, ghi chép định kỳ hoặc truy cập từng thiết bị riêng lẻ—thường bộc lộ các hạn chế rõ rệt. Dữ liệu khó đồng bộ theo mốc thời gian, khó so sánh giữa nhiều thiết bị, dễ trễ thông tin khi số lượng điểm đo tăng, và gần như không thể phản ứng kịp khi cần cảnh báo tức thời. Nhu cầu theo dõi dữ liệu cảm biến theo thời gian thực trong đề tài được cụ thể hóa bằng việc thiết bị (hoặc script giả lập) gửi telemetry lên máy chủ ngay khi đo được, đồng thời giao diện web truy vấn lịch sử, bản ghi mới nhất và vẽ biểu đồ theo metric—giúp người dùng quan sát xu hướng và biến động gần đây thay vì chỉ một ảnh chụp tĩnh.

Song song đó, nhu cầu cảnh báo khi vượt ngưỡng xuất hiện từ yêu cầu vận hành thực tế: khi một chỉ số vượt ngưỡng cho phép, hệ thống cần có cơ chế thông báo để con người can thiệp kịp thời. Trong mã nguồn hiện tại, nhu cầu này được đáp ứng bằng luật cảnh báo theo metric và điều kiện so sánh, kèm gửi tin qua Telegram và lưu lịch sử để đối chiếu. Cuối cùng, khi số thiết bị và số người tham gia vận hành tăng lên, nhu cầu quản lý nhiều thiết bị và người dùng trở thành yếu tố cấp thiết: hệ thống cần phân biệt chủ sở hữu thiết bị, cho phép gán người xem, và xác thực người dùng web qua tài khoản—đúng với các chức năng đã triển khai trong backend và giao diện quản trị.

## 2.2 Yêu cầu hệ thống

Phần dưới đây hệ thống hóa các yêu cầu được suy ra từ chức năng thực tế của **IoT Device Platform** (REST API, ứng dụng web và script giả lập) như đã mô tả trong README và mã nguồn.

### Yêu cầu chức năng

Các yêu cầu chức năng gắn với từng nhóm tác vụ người dùng và luồng dữ liệu đã được cài đặt. Bảng sau liệt kê chức năng chính và mô tả ngắn gọn căn cứ trên hệ thống hiện có.

| STT | Chức năng | Mô tả theo hệ thống hiện tại |
|-----|-----------|------------------------------|
| 1 | Đăng ký / đăng nhập | Người dùng tạo tài khoản và đăng nhập; backend cấp JWT để frontend gọi các API cần xác thực. |
| 2 | Quản lý thiết bị | Tạo, xem danh sách, xem chi tiết, xóa thiết bị; xóa thiết bị theo quyền chủ sở hữu. Mỗi thiết bị có token phục vụ gửi telemetry. |
| 3 | Gửi dữ liệu cảm biến (telemetry) | Thiết bị gửi `POST /telemetry/` kèm header `x-device-token`; dữ liệu được chuẩn hóa và lưu vào cơ sở dữ liệu. |
| 4 | Xem lịch sử dữ liệu | Truy vấn lịch sử telemetry theo thiết bị (có tham số giới hạn và khoảng thời gian); xem bản ghi mới nhất. |
| 5 | Thống kê theo chỉ số (metric) | Thống kê trung bình, cực đại, cực tiểu theo từng metric phục vụ biểu đồ và tổng quan trên giao diện. |
| 6 | Quản lý thuộc tính thiết bị | Thêm, liệt kê, xóa thuộc tính (attributes) gắn với thiết bị. |
| 7 | Quản lý viewer | Xem danh sách người xem, thêm và xóa viewer cho thiết bị do chủ sở hữu cấu hình. |
| 8 | Tạo luật cảnh báo | Tạo và cập nhật luật theo tên metric, điều kiện so sánh, ngưỡng, nội dung tin nhắn và thời gian cooldown; luật có thể bật hoặc tắt theo mô hình dữ liệu trong dự án. |
| 9 | Gửi cảnh báo Telegram | Khi điều kiện thỏa mãn và logic chống trùng cho phép, hệ thống gửi tin qua Telegram Bot API (cấu hình bằng biến môi trường). |
| 10 | Lưu lịch sử cảnh báo | Ghi nhận các lần gửi cảnh báo để tra cứu theo thiết bị trên giao diện. |
| 11 | Dashboard trực quan | Trang tổng quan hiển thị số liệu tổng hợp (thiết bị, cảnh báo) và điều hướng tới các khu vực chức năng; trang chi tiết thiết bị có biểu đồ và bảng dữ liệu. |

Ngoài các mục trên, hệ thống còn cung cấp API lấy danh sách người dùng (phục vụ chọn viewer) và các trang giao diện tương ứng (cảnh báo toàn cục, lịch sử cảnh báo theo thiết bị) như đã có trong mã nguồn frontend.

### Yêu cầu phi chức năng

Bên cạnh các chức năng cụ thể, đề tài cần đảm bảo một số yêu cầu phi chức năng phù hợp với kiến trúc đã chọn và với mục đích minh họa, kiểm thử và triển khai quy mô nhỏ.

Về **hiệu năng**, backend sử dụng FastAPI trên Uvicorn (ASGI), phù hợp với xử lý nhiều request API; truy vấn telemetry và thống kê được thực hiện qua SQLAlchemy trên PostgreSQL. Mức độ tối ưu chi tiết (chỉ mục, phân trang nâng cao) phụ thuộc cấu hình cơ sở dữ liệu và quy mô dữ liệu, song nền tảng đã đủ cho bài toán giám sát và minh họa luồng gần thời gian thực.

Về **bảo mật**, người dùng web được xác thực bằng JWT; thiết bị được xác thực bằng token riêng khi gửi telemetry. Các dependency trong FastAPI kiểm tra quyền truy cập thiết bị (owner/viewer) cho thao tác phù hợp. CORS được cấu hình cho nguồn gốc frontend phát triển cục bộ. Token Telegram và chuỗi kết nối cơ sở dữ liệu được đọc từ biến môi trường theo hướng dẫn trong README.

Về **khả năng mở rộng**, tách biệt frontend (SPA React) và backend (REST API) cho phép mở rộng từng phần: có thể thêm thiết bị và người dùng mới mà không đổi mô hình tổng thể; cơ sở dữ liệu quan hệ hỗ trợ tăng dần khối lượng bản ghi telemetry. README nêu thêm các hướng phát triển (migration Alembic, Docker Compose) như bước tăng trưởng sau này.

Về **khả năng bảo trì**, mã nguồn tổ chức theo thư mục `api`, `services`, `models`, `schemas` ở backend và `pages`, `components`, `hooks`, `services` ở frontend, giúp phân tách trách nhiệm và dễ định vị phần cần chỉnh sửa.

Về **giao diện thân thiện**, ứng dụng web sử dụng layout thống nhất, các trang dashboard, danh sách thiết bị, chi tiết thiết bị và cảnh báo; biểu đồ Recharts và bảng telemetry hỗ trợ đọc nhanh dữ liệu chuỗi thời gian.

Về **tính tương thích đa trình duyệt**, frontend là ứng dụng React chạy trên Vite, phù hợp với các trình duyệt hiện đại hỗ trợ JavaScript theo chuẩn toolchain đang sử dụng; giao diện không phụ thuộc plugin độc quyền. Việc kiểm tra chi tiết trên từng phiên bản trình duyệt thuộc khâu kiểm thử triển khai, trong khi kiến trúc web mở rộng theo các chuẩn phổ biến.

## 2.3 Phân tích tính khả thi

### Khả thi kỹ thuật

Về mặt kỹ thuật, bộ công nghệ được sử dụng trong dự án là các thành phần đã phổ biến và có tài liệu đầy đủ, do đó giảm rủi ro không triển khai được phần lõi. **FastAPI** cung cấp khai báo route rõ ràng, tự động tài liệu hóa API và tích hợp dependency injection cho xác thực; phù hợp với luồng nhận telemetry và gọi dịch vụ nghiệp vụ sau mỗi lần ghi dữ liệu. **SQLAlchemy** kết hợp **PostgreSQL** đáp ứng lưu trữ có cấu trúc cho người dùng, thiết bị, telemetry và lịch sử cảnh báo; truy vấn thống kê theo metric nằm trong khả năng của cơ sở dữ liệu quan hệ. **React** và Vite phía máy khách cho phép xây dựng dashboard tương tác, gọi API qua axios và hiển thị biểu đồ với Recharts. Thư mục **fake_devices** chứng minh khả năng mô phỏng luồng thiết bị mà không cần phần cứng tùy chỉnh ngay từ đầu. **Tích hợp Telegram** qua HTTP (httpx) với Bot API là phương án đơn giản, dễ cấu hình bằng biến môi trường và phù hợp với mục tiêu cảnh báo tức thời trong phạm vi đồ án. Tổng thể, các thành phần khớp với nhau theo mô hình client–server và đã được minh chứng bằng mã nguồn chạy được theo hướng dẫn trong README.

### Khả thi kinh tế

Về kinh tế và chi phí tiếp cận, hầu hết công nghệ lõi (Python, FastAPI, React, PostgreSQL, Vite, Tailwind…) thuộc hệ sinh thái **mã nguồn mở**, không phát sinh phí bản quyền cơ bản cho việc phát triển và học tập. **Chi phí triển khai thử nghiệm** có thể giữ ở mức thấp: máy tính cá nhân cài đặt PostgreSQL, chạy backend và frontend cục bộ như hướng dẫn. Giai đoạn mô phỏng dùng **script Python** thay cho thiết bị IoT thật giúp giảm chi phí mua phần cứng và vẫn kiểm chứng được luồng telemetry và cảnh báo. Chi phí có thể phát sinh khi thuê hạ tầng máy chủ hoặc dịch vụ cloud nếu triển khai công khai; dịch vụ Telegram trong phạm vi sử dụng đồ án thường nằm trong khả năng chấp nhận được.

### Khả thi vận hành

Về vận hành và đưa vào sử dụng, hệ thống hướng tới người dùng quen giao diện **web**, không yêu cầu cài đặt ứng dụng độc quyền trên máy trạm; người dùng đăng nhập và thao tác trên các trang đã triển khai. Việc **triển khai cục bộ hoặc trên máy chủ** đều khả thi vì backend là dịch vụ HTTP chuẩn và frontend build ra tệp tĩnh; README mô tả các bước chạy local. Sau này, khi có thiết bị thật, có thể cấu hình thiết bị gửi đúng endpoint và token như luồng script giả lập đã làm mà không cần thay đổi kiến trúc tổng thể—điều này nâng khả năng **tiếp nối triển khai thực địa**. Rủi ro vận hành chủ yếu nằm ở bảo vệ token, sao lưu cơ sở dữ liệu và tải hệ thống khi số lượng thiết bị tăng mạnh; đó là các vấn đề có thể quy hoạch dần trong giai đoạn sau.

Kết luận chung của chương: nhu cầu thực tế về giám sát tập trung, cảnh báo và quản lý đa thiết bị được phản ánh qua các yêu cầu chức năng và phi chức năng trên; phương án kỹ thuật của **IoT Device Platform** có **tính khả thi cao** trong bối cảnh đồ án và triển khai quy mô nhỏ, đồng thời để ngỏ hướng mở rộng phù hợp với lộ trình được gợi ý trong tài liệu dự án.

# CHƯƠNG 3 PHÂN TÍCH HỆ THỐNG

## 3.1 Biểu đồ Use Case

### Giới thiệu Use Case

Biểu đồ Use Case (Use Case Diagram) là một biểu đồ trong ngôn ngữ mô hình hóa hướng đối tượng, dùng để mô tả chức năng của hệ thống từ góc nhìn người dùng và các tác nhân tương tác với hệ thống. Mục đích sử dụng trong giai đoạn phân tích là làm rổ phạm vi nghiệp vụ, tránh bỏ sót hoặc trùng lặp chức năng, đồng thời là cơ sở trao đổi giữa người phân tích, người phát triển và người sử dụng. Trong báo cáo này, biểu đồ Use Case được dùng để mô tả **tác nhân** (actor) và các **ca sử dụng** (use case) tương ứng với các luồng đã được cài đặt trong dự án **IoT Device Platform**, căn cứ README và mã nguồn backend–frontend.

### Xác định tác nhân của hệ thống

Các tác nhân sau được xác định trên cơ sở vai trò thực tế trong hệ thống:

- **Owner (chủ sở hữu thiết bị / người dùng đã đăng nhập với quyền sở hữu)**  
  Là người dùng có tài khoản, tạo và sở hữu một hoặc nhiều thiết bị. Owner được phép thực hiện các thao tác quản trị đối với thiết bị của mình: tạo, xóa thiết bị; thêm, xóa thuộc tính; thêm, gỡ người xem; tạo và cập nhật luật cảnh báo khi API yêu cầu quyền chủ sở hữu (theo `assert_device_owner` và `device_permission("owner")` trong mã nguồn).

- **Viewer (người xem thiết bị)**  
  Là người dùng được Owner chỉ định trong bảng quan hệ viewer–thiết bị. Viewer có thể xem thông tin thiết bị, telemetry, thống kê, thuộc tính (đọc), danh sách luật cảnh báo và lịch sử cảnh báo trên các endpoint cho phép `device_permission("viewer")`, nhưng **không** được xóa thiết bị, không thêm/sửa/xóa thuộc tính, không thêm/gỡ viewer, không tạo hay cập nhật luật cảnh báo (theo các route trong `device_routes` và `alert_routes`).

- **Thiết bị / Fake Device Script**  
  Đại diện cho thiết bị IoT thật hoặc script mô phỏng trong thư mục `fake_devices`. Tác nhân này gọi API gửi telemetry với header `x-device-token`; hệ thống xác thực token với bảng thiết bị trước khi chấp nhận dữ liệu (dependency `verify_device`).

- **Telegram Bot API (hệ thống ngoài)**  
  Là dịch vụ bên ngoài biên hệ thống ứng dụng: backend gửi yêu cầu HTTP tới Bot API để chuyển tin nhắn cảnh báo tới kênh chat đã cấu hình. Trong mô hình Use Case, tác nhân này phù hợp để thể hiện **phụ thuộc ra bên ngoài** (external system), không phải người dùng cuối.

Ngoài ra, khi vẽ biểu đồ có thể gom **Hệ thống IoT Device Platform** vào một khối (system boundary) và đặt các use case nội bộ bên trong; các tác nhân người và thiết bị đặt bên ngoài biên.

### Xác định các ca sử dụng (Use Case)

Dưới đây là các use case chính, bám sát API và giao diện đã triển khai. Phân nhóm theo tác nhân khởi phát tương tác; một số use case thực hiện nội bộ sau khi thiết bị gửi dữ liệu được ghi nhận là luồng hệ thống.

**Owner**

- Đăng ký tài khoản (`POST /auth/register`).
- Đăng nhập (`POST /auth/login`), nhận JWT.
- Tạo thiết bị (`POST /devices/`).
- Xem danh sách thiết bị (thiết bị sở hữu và thiết bị được xem với tư cách viewer—`GET /devices/`).
- Xem chi tiết thiết bị (`GET /devices/{id}`).
- Xóa thiết bị (`DELETE /devices/{id}`—chỉ owner).
- Xem lịch sử telemetry, bản ghi mới nhất, thống kê theo metric (`GET .../telemetry`, `.../latest`, `.../stats`).
- Quản lý thuộc tính: thêm, xem, xóa (`POST/GET/DELETE .../attributes`—thao tác ghi/xóa là owner).
- Quản lý viewer: xem danh sách, thêm, gỡ (`GET/POST/DELETE .../viewers`—thêm/gỡ là owner).
- Tạo luật cảnh báo (`POST /alert-rules/`), cập nhật luật (`PATCH /alert-rules/rules/{rule_id}`).
- Xem danh sách luật và lịch sử cảnh báo theo thiết bị (`GET /alert-rules/{device_id}`, `GET /alert-rules/device/{device_id}`).
- Xem danh sách người dùng phục vụ chọn viewer (`GET /users/`).
- Sử dụng giao diện: Dashboard, danh sách thiết bị, trang chi tiết thiết bị (overview, attributes, viewers, alerts, lịch sử cảnh báo) theo các trang trong `frontend/src/pages`.

**Viewer**

- Xem danh sách thiết bị có quyền (owner hoặc viewer—cùng endpoint `GET /devices/`).
- Xem chi tiết thiết bị được phân quyền.
- Xem telemetry, thống kê, thuộc tính (đọc), danh sách viewer (đọc), danh sách luật và lịch sử cảnh báo.
- Truy cập các trang tương ứng trên giao diện cho thiết bị được xem (không có quyền chỉnh sửa các mục chỉ dành cho owner trên API).

**Thiết bị / Fake Device**

- Gửi telemetry (`POST /telemetry/` kèm `x-device-token`).
- (Hành vi nội bộ) Sau khi lưu telemetry, hệ thống đánh giá luật cảnh báo và có thể gửi Telegram, ghi `alert_history`—không do người dùng web khởi phát trực tiếp.

**Telegram Bot API (hệ thống ngoài)**

- Nhận yêu cầu gửi tin nhắn từ backend (endpoint Bot API `sendMessage` qua `httpx` trong `telegram_service`).

### Xác định mối quan hệ

Trong mô hình Use Case chuẩn UML, quan hệ **«include»** mô tả một use case cơ sở luôn kết hợp hành vi của use case khác (bắt buộc). Quan hệ **«extend»** mô tả use case mở rộng có điều kiện, chỉ chạy khi thỏa điều kiện cụ thể. Bảng dưới đây tổng hợp các use case chính và gợi ý quan hệ hợp lý với hệ thống hiện tại (có thể điều chỉnh nhãn khi vẽ cho gọn sơ đồ).

| Actor | Use Case chính | Include | Extend |
| ----- | -------------- | ------- | ------ |
| Owner | Đăng nhập | Xác thực và cấp JWT | — |
| Owner | Tạo / xóa thiết bị | Xác thực người dùng (JWT) | — |
| Owner | Quản lý thuộc tính (thêm/xóa) | Kiểm tra quyền owner trên thiết bị | — |
| Owner | Quản lý viewer (thêm/gỡ) | Kiểm tra quyền owner | — |
| Owner | Tạo / cập nhật luật cảnh báo | Kiểm tra quyền owner trên thiết bị | — |
| Owner / Viewer | Xem dashboard / danh sách thiết bị | Đăng nhập (JWT) | — |
| Owner / Viewer | Xem telemetry & thống kê theo metric | Kiểm tra quyền owner hoặc viewer | Xem biểu đồ (giao diện—lấy dữ liệu stats/series) |
| Viewer | Xem thiết bị & dữ liệu giám sát | Kiểm tra quyền viewer | — |
| Thiết bị | Gửi telemetry | Xác thực `x-device-token` (mapping thiết bị) | Đánh giá luật cảnh báo sau khi lưu |
| Hệ thống (nội bộ) | Đánh giá luật cảnh báo | Đọc giá trị metric, so sánh điều kiện | Gửi tin Telegram (khi đủ điều kiện gửi theo logic chống spam/cooldown) |
| Hệ thống (nội bộ) | Gửi cảnh báo Telegram | Ghi nhận lịch sử cảnh báo khi gửi thành công (theo luồng trong `alert_service`) | — |
| Telegram Bot API | (Liên kết phụ) Nhận tin cảnh báo | — | — |

Giải thích ngắn: **Gửi telemetry** luôn đi kèm bước **xác thực token thiết bị** nên quan hệ include là phù hợp. Sau khi lưu telemetry, việc **kiểm tra luật** có thể mô hình hóa là phần mở rộng có điều kiện (extend) của luồng gửi dữ liệu—vì chỉ khi có luật bật và đọc được metric thì mới xảy ra xử lý cảnh báo đầy đủ. **Gửi Telegram** không phải hành vi của Owner khi “tạo luật”, mà xảy ra khi có telemetry và điều kiện cảnh báo thỏa mãn; do đó không nên «include» “gửi Telegram” vào use case “tạo luật cảnh báo”, tránh sai semantics so với mã nguồn.

### Kết luận mục 3.1

Biểu đồ Use Case giúp tổng quan hóa các chức năng của **IoT Device Platform** theo vai trò Owner, Viewer, Thiết bị và tương tác với **Telegram Bot API**, đồng thời làm rõ ranh giới giữa thao tác người dùng trên web và luồng tự động xử lý sau khi nhận telemetry. Đây là cơ sở để chuyển sang các mục thiết kế tiếp theo (thiết kế luồng dữ liệu, thiết kế API, thiết kế cơ sở dữ liệu hoặc giao diện) mà không trùng lặp hoặc bỏ sót chức năng đã phân tích.

### Gợi ý danh sách Use Case để vẽ sơ đồ (draw.io / StarUML)

Dưới đây là danh sách gợi ý (có mã định danh ngắn) để người đọc dễ kéo thả và nối quan hệ trên draw.io hoặc StarUML. Có thể gom nhóm trong các package: **Xác thực**, **Thiết bị & telemetry**, **Cảnh báo**, **Tích hợp ngoài**.

**Nhóm xác thực người dùng**

- UC-A01: Đăng ký tài khoản  
- UC-A02: Đăng nhập (cấp JWT)  

**Nhóm quản lý thiết bị (Owner)**

- UC-D01: Tạo thiết bị  
- UC-D02: Xem danh sách thiết bị (owner + viewer)  
- UC-D03: Xem chi tiết thiết bị  
- UC-D04: Xóa thiết bị  

**Nhóm telemetry**

- UC-T01: Gửi telemetry (thiết bị, header `x-device-token`)  
- UC-T02: Xem lịch sử telemetry (lọc giới hạn / khoảng thời gian)  
- UC-T03: Xem telemetry mới nhất  
- UC-T04: Xem thống kê theo metric (avg/max/min)  

**Nhóm thuộc tính & viewer**

- UC-V01: Thêm thuộc tính thiết bị (owner)  
- UC-V02: Xem danh sách thuộc tính (owner/viewer)  
- UC-V03: Xóa thuộc tính (owner)  
- UC-V04: Xem danh sách viewer (owner/viewer)  
- UC-V05: Thêm viewer (owner)  
- UC-V06: Gỡ viewer (owner)  
- UC-V07: Xem danh sách người dùng (hỗ trợ chọn viewer)  

**Nhóm cảnh báo**

- UC-L01: Tạo luật cảnh báo (owner)  
- UC-L02: Cập nhật luật cảnh báo (owner)  
- UC-L03: Xem danh sách luật theo thiết bị (owner/viewer)  
- UC-L04: Xem lịch sử cảnh báo theo thiết bị (owner/viewer)  
- UC-L05: Đánh giá luật khi có telemetry mới (hệ thống)  
- UC-L06: Gửi tin cảnh báo qua Telegram (hệ thống → Bot API)  

**Nhóm giao diện (tùy gom vào UC trên hoặc tách riêng)**

- UC-G01: Xem dashboard tổng quan  
- UC-G02: Xem trang chi tiết thiết bị (biểu đồ, bảng)  

Khi vẽ, nên đặt **Owner**, **Viewer**, **Thiết bị** ở phía trái/ngoài biên; đặt **Telegram Bot API** ở phía phải nếu thể hiện hệ thống ngoài; các UC nội bộ như UC-L05, UC-L06 có thể liên kết với UC-T01 bằng «extend» hoặc đặt trong vùng “Automated processes” tùy quy ước đồ án.

## 3.2 Biểu đồ hoạt động (Activity Diagram)

Biểu đồ hoạt động (Activity Diagram) mô tả trình tự các hành động, nhánh điều kiện và luồng xử lý song song (nếu có) trong một quy trình nghiệp vụ. Khác với biểu đồ Use Case—nhấn mạnh “ai làm gì”—biểu đồ hoạt động giúp làm rõ **cách thức thực hiện** từng bước bên trong hệ thống, phục vụ trực tiếp cho việc kiểm chứng tính nhất quán giữa phân tích và cài đặt mã nguồn. Trong phần này, hai quy trình tiêu biểu của **IoT Device Platform** được mô tả ở mức chi tiết có thể chuyển hóa thành sơ đồ hoạt động trên các công cụ mô hình hóa: (1) luồng **gửi telemetry và xử lý cảnh báo** phía máy chủ; (2) luồng **xem dữ liệu giám sát** trên ứng dụng web (từ đăng nhập đến hiển thị biểu đồ và bảng). Các bước được căn cứ vào các route FastAPI, dịch vụ `telemetry_service`, `alert_service` và các trang React tương ứng.

### 3.2.1 Biểu đồ hoạt động cho use case: Gửi telemetry và xử lý cảnh báo

#### Mô tả luồng xử lý tổng quát

Luồng này bắt đầu khi **thiết bị** (hoặc script trong thư mục `fake_devices`) gửi yêu cầu HTTP tới endpoint nhận telemetry. Hệ thống thực hiện **xác thực danh tính thiết bị** thông qua giá trị `x-device-token` trong header; sau đó **chuẩn hóa và lưu** payload vào cơ sở dữ liệu. Ngay sau khi bản ghi telemetry được ghi nhận, tầng nghiệp vụ gọi `check_alerts()` để **duyệt các luật cảnh báo đang bật** của thiết bị, đọc giá trị metric trong payload và so sánh với ngưỡng. Tùy trạng thái (kích hoạt mới, nhắc lại khi còn cảnh báo, hoặc phục hồi), hệ thống có thể **gửi tin nhắn qua Telegram Bot API**; chỉ khi gửi thành công, một bản ghi tương ứng mới được **ghi vào lịch sử cảnh báo**. Cuối cùng, phản hồi HTTP trả về thông tin bản ghi telemetry đã lưu cho phía thiết bị. Như vậy, việc lưu telemetry **luôn hoàn tất** khi dữ liệu hợp lệ, còn việc gửi Telegram và ghi lịch sử phụ thuộc điều kiện nghiệp vụ và kết quả gọi dịch vụ ngoài.

#### Bảng mô tả use case

| Trường | Nội dung |
|--------|----------|
| Mã Use Case | UC-T01 |
| Tên Use Case | Gửi telemetry và xử lý cảnh báo tự động |
| Tác nhân chính | Thiết bị / Fake Device Script |
| Tác nhân phụ (hệ thống ngoài) | Telegram Bot API (nhận yêu cầu gửi tin khi có) |
| Mô tả ngắn | Thiết bị đẩy dữ liệu đo được lên máy chủ; hệ thống xác thực token, lưu telemetry, đánh giá luật cảnh báo, có thể gửi thông báo Telegram và lưu lịch sử cảnh báo, rồi trả kết quả cho thiết bị. |
| Tiền điều kiện | Thiết bị đã được tạo trên hệ thống và có `device_token` hợp lệ; payload gửi lên có cấu trúc phù hợp với schema `TelemetryCreate` (trường `data` là đối tượng). |
| Hậu điều kiện | Nếu xác thực và kiểm tra dữ liệu thành công: có bản ghi telemetry mới trong cơ sở dữ liệu; trạng thái luật cảnh báo và lịch sử (nếu có) được cập nhật theo logic trong `alert_service`; phản hồi API chứa bản ghi telemetry đã lưu. Nếu token không hợp lệ hoặc dữ liệu không hợp lệ: không ghi telemetry; trả mã lỗi tương ứng. |

#### Luồng sự kiện chính

| STT | Thực hiện bởi | Hành động |
|-----|----------------|-----------|
| 1 | Thiết bị / script | Gửi yêu cầu `POST /telemetry/` kèm header `x-device-token` và thân tin nhắn chứa trường `data` (dạng JSON object). |
| 2 | Hệ thống (dependency `verify_device`) | Tra cứu `device_token` trong bảng thiết bị; nếu khớp thì gắn thiết bị với yêu cầu, nếu không thì từ chối. |
| 3 | Hệ thống (`telemetry_service.create_telemetry`) | Kiểm tra `data` là kiểu dictionary; chuẩn hóa dữ liệu bằng `normalize_telemetry_data`; tạo và lưu bản ghi telemetry, `commit` vào PostgreSQL. |
| 4 | Hệ thống (`alert_service.check_alerts`) | Nạp các luật cảnh báo đang `enabled` của thiết bị; với mỗi luật, đọc giá trị metric từ `telemetry.data`, đánh giá điều kiện so với ngưỡng; áp dụng logic kích hoạt, nhắc lại (cooldown) hoặc phục hồi tùy trạng thái hiện tại của luật. |
| 5 | Hệ thống (tích hợp Telegram) | Nếu cần gửi tin theo logic bước 4, gọi Telegram Bot API qua HTTP; nếu gửi thành công thì tiếp tục bước 6 cho sự kiện đó. |
| 6 | Hệ thống (`save_alert`) | Ghi bản ghi vào lịch sử cảnh báo (`alert_history`) khi tin Telegram gửi thành công (trường `sent_to` ghi nhận kênh telegram). |
| 7 | Hệ thống | Trả về `TelemetryResponse` (mã HTTP thành công) cho thiết bị, phản ánh bản ghi telemetry đã lưu. |

#### Luồng sự kiện thay thế

| STT | Điều kiện | Xử lý |
|-----|-----------|--------|
| A1 | Token thiết bị không tồn tại hoặc không khớp | Trả lỗi 403 (Forbidden) theo `verify_device`; không lưu telemetry, không chạy `check_alerts`. |
| A2 | Trường `data` không phải dictionary | Ném `DomainValidationError`, trả về lỗi 400; không lưu telemetry. |
| A3 | Với một luật cụ thể: không đọc được giá trị metric từ payload (thiếu khóa hoặc không chuyển được sang số để so sánh) | Bỏ qua luật đó trong vòng lặp; luồng tổng thể vẫn thành công nếu các bước trước đã lưu telemetry. |
| A4 | Không có luật nào bật hoặc không có luật nào thỏa điều kiện gửi tin tại thời điểm đó | Không gửi Telegram, không ghi `alert_history` cho sự kiện cảnh báo; vẫn trả `TelemetryResponse` thành công. |
| A5 | Gọi Telegram thất bại (mã lỗi HTTP, lỗi mạng, phản hồi `ok` false…) | Ghi log lỗi phía dịch vụ Telegram; **không** gọi `save_alert` cho lần gửi đó; trạng thái luật vẫn có thể được cập nhật theo nhánh `check_alerts` tùy đoạn mã; telemetry vẫn đã được lưu ở bước 3. |
| A6 | Lỗi ràng buộc cơ sở dữ liệu hoặc lỗi không lường trước khi hoàn tất phản hồi | Trả lỗi 400 (handler `IntegrityError`) hoặc lỗi máy chủ tùy ngữ cảnh; thiết bị không nhận được phản hồi thành công chuẩn. |

Biểu đồ hoạt động tương ứng nên thể hiện **nhánh quyết định** sau bước xác thực token, sau kiểm tra `data`, sau vòng luật cảnh báo (có gửi Telegram hay không), và nhánh lỗi tích hợp.

### 3.2.2 Biểu đồ hoạt động cho use case: Xem dữ liệu giám sát trên dashboard

#### Mô tả luồng xử lý tổng quát

Use case này mô tả hành vi của **người dùng đã xác thực** (Owner hoặc Viewer) khi sử dụng giao diện web để **theo dõi tổng quan và chi tiết** dữ liệu giám sát. Trên trang **Dashboard**, ứng dụng tải danh sách thiết bị mà người dùng có quyền (sở hữu hoặc được xem), đồng thời có thể gọi thêm các API tóm tắt (ví dụ telemetry mới nhất, số lượng bản ghi lịch sử cảnh báo) để hiển thị thẻ tổng quan. Khi người dùng **chọn một thiết bị** và điều hướng tới trang **chi tiết giám sát** (Device Overview), ứng dụng gửi các yêu cầu REST kèm JWT; mỗi yêu cầu liên quan thiết bị đều đi qua cơ chế **kiểm tra quyền truy cập** (`device_permission`) để đảm bảo người dùng là chủ sở hữu hoặc viewer hợp lệ. Sau khi được phép, hệ thống trả về **lịch sử telemetry**, **thống kê theo metric** và dữ liệu phục vụ giao diện; trình duyệt hiển thị **biểu đồ** (Recharts) và **bảng** dữ liệu theo các hook `useTelemetry`, `useTelemetryStats`. Luồng này phản ánh đúng cách người dùng “vận hành giám sát” trong hệ thống hiện tại, không chỉ dừng ở một màn hình đơn lẻ mà gắn kết dashboard và trang chi tiết.

#### Bảng mô tả use case

| Trường | Nội dung |
|--------|----------|
| Mã Use Case | UC-G01 |
| Tên Use Case | Xem dữ liệu giám sát trên giao diện web (dashboard và chi tiết thiết bị) |
| Tác nhân | Owner (chủ sở hữu thiết bị); Viewer (người được cấp quyền xem) |
| Mô tả ngắn | Người dùng đăng nhập, chọn thiết bị có quyền, hệ thống kiểm tra quyền trên từng API, truy vấn telemetry và thống kê, hiển thị biểu đồ và bảng trên trình duyệt. |
| Tiền điều kiện | Tài khoản đã đăng ký; phiên làm việc có JWT hợp lệ (trình duyệt đính kèm token khi gọi API); người dùng có ít nhất một thiết bị trong phạm vi quyền nếu muốn thấy dữ liệu thực. |
| Hậu điều kiện | Trên giao diện hiển thị được danh sách thiết bị (nếu có), hoặc trang chi tiết với biểu đồ/bảng dựa trên dữ liệu API; nếu không có quyền hoặc lỗi, người dùng nhận thông báo lỗi phù hợp trên UI hoặc không truy cập được tài nguyên. |

#### Luồng sự kiện chính

| STT | Thực hiện bởi | Hành động |
|-----|----------------|-----------|
| 1 | Người dùng | Đăng nhập qua form đăng nhập; hệ thống cấp JWT và lưu trữ phía client để dùng cho các lần gọi API sau. |
| 2 | Người dùng | Mở trang Dashboard hoặc trang danh sách thiết bị; ứng dụng gọi `GET /devices/` để lấy danh sách thiết bị mà người dùng sở hữu hoặc được xem. |
| 3 | Người dùng | Chọn một thiết bị (điều hướng tới route chi tiết, ví dụ trang tổng quan thiết bị / Device Overview). |
| 4 | Hệ thống (mỗi request tới tài nguyên thiết bị) | Xác thực JWT và áp dụng `device_permission`: cho phép nếu người dùng là `owner_id` hoặc nằm trong danh sách viewer; ngược lại trả 403. |
| 5 | Hệ thống | Trả về dữ liệu lịch sử telemetry (`GET /devices/{id}/telemetry` với tham số giới hạn và khoảng thời gian theo cấu hình giao diện). |
| 6 | Hệ thống | Trả về thống kê theo metric đã chọn (`GET /devices/{id}/telemetry/stats?metric=...`) phục vụ tóm tắt min/max/avg. |
| 7 | Ứng dụng web | Kết xuất biểu đồ (một hoặc nhiều metric), bảng telemetry, và các thành phần tổng hợp khác trên trang chi tiết (theo `DeviceOverviewPage` và các component chart/table). |

#### Luồng sự kiện thay thế

| STT | Điều kiện | Xử lý |
|-----|-----------|--------|
| B1 | Người dùng không có quyền trên thiết bị được yêu cầu | API trả 403 Forbidden; giao diện có thể chuyển hướng hoặc hiển thị thông báo lỗi tùy cách bắt lỗi ở client. |
| B2 | Chưa có bản ghi telemetry (ví dụ thiết bị mới chưa gửi dữ liệu) | Danh sách telemetry rỗng; biểu đồ có thể không có điểm; hook `useTelemetry`/`extractMetricKeys` xử lý trạng thái không có metric; không có lỗi nghiệp vụ nếu API trả thành công với mảng rỗng. |
| B3 | Truy vấn thống kê thiếu tham số `metric` hoặc metric không hợp lệ | Backend trả lỗi 400 (`DomainValidationError`); giao diện cần chọn metric hợp lệ trước khi gọi stats. |
| B4 | Lỗi mạng, lỗi máy chủ hoặc token hết hạn | Trình duyệt nhận lỗi HTTP hoặc lỗi client; hiển thị thông báo lỗi trên trang (thông điệp lấy từ `detail` hoặc thông báo mặc định); người dùng có thể phải đăng nhập lại nếu 401. |

Như vậy, mục 3.2 đã cụ thể hóa hai quy trình trọng tâm bằng ngôn ngữ hoạt động: một nhằm đảm bảo **luồng dữ liệu từ thiết bị lên máy chủ và xử lý cảnh báo**, một nhằm mô tả **luồng tương tác người dùng–API–giao diện** khi giám sát. Đây là cơ sở để vẽ biểu đồ hoạt động (swimlane: Thiết bị / Hệ thống / Telegram; hoặc Người dùng / Frontend / Backend / Cơ sở dữ liệu) và liên kết trở lại với các use case đã nêu ở mục 3.1.

## 3.3 Biểu đồ trình tự (Sequence Diagram)

Biểu đồ trình tự (Sequence Diagram) là một trong các biểu đồ hành vi của ngôn ngữ UML, dùng để mô tả **trình tự trao đổi thông điệp** giữa các đối tượng hoặc thành phần hệ thống theo trục thời gian. Khác với biểu đồ hoạt động—thường nhấn mạnh luồng xử lý và nhánh điều kiện nội bộ—biểu đồ trình tự làm nổi bật **ai gọi ai**, **qua giao diện nào** (HTTP endpoint, dependency, dịch vụ), và **thứ tự gọi** giữa tầng giao diện, tầng nghiệp vụ, lưu trữ và hệ thống ngoài. Trong giai đoạn phân tích và thiết kế phần mềm, biểu đồ trình tự giúp kiểm tra tính nhất quán giữa đặc tả và triển khai, đồng thời là tài liệu trực quan cho việc triển khai thử nghiệm và bảo trì sau này.

Đối với **IoT Device Platform**, biểu đồ trình tự được áp dụng cho hai kịch bản đại diện: luồng **thiết bị đẩy telemetry và máy chủ xử lý cảnh báo**, và luồng **người dùng web truy vấn dữ liệu giám sát**. Các thành phần được phân loại theo quy ước phổ biến: tác nhân bên ngoài (actor), ranh giới hệ thống (boundary—endpoint hoặc trang giao diện), điều phối nghiệp vụ (controller/service), thực thể dữ liệu (entity—PostgreSQL), cùng hệ thống ngoài (Telegram Bot API). Dưới đây, mỗi kịch bản được diễn giải bằng văn bản trước khi người đọc đối chiếu với hình vẽ tương ứng trong báo cáo.

### 3.3.1 Biểu đồ trình tự cho luồng gửi telemetry và xử lý cảnh báo

Trong kịch bản này, giao tiếp xuất phát từ **thiết bị IoT** hoặc **script giả lập** trong thư mục `fake_devices`, không đi qua phiên đăng nhập người dùng mà dựa trên **token thiết bị**. Ranh giới tiếp nhận yêu cầu là **Telemetry API** (`router` tiền tố `/telemetry` trong `telemetry_routes`), nơi hàm endpoint `POST /` nhận thân tin nhắn theo schema `TelemetryCreate`. Trước khi vào nghiệp vụ, dependency `verify_device` thực hiện tra cứu header `x-device-token` trong bảng thiết bị; đây đóng vai trò **kiểm soát truy cập** gắn liền với boundary. Phần xử lý chính nằm ở **telemetry_service** (`create_telemetry`): kiểm tra kiểu dữ liệu, chuẩn hóa payload, ghi bản ghi vào PostgreSQL. Sau khi commit, **alert_service** (`check_alerts`) đọc các luật đang bật, so khớp metric với ngưỡng và quyết định gửi tin nhắn qua **Telegram Bot API** bằng HTTP client (`httpx` trong `telegram_service`). Khi gửi thành công, hệ thống bổ sung bản ghi vào **alert_history** thông qua `save_alert`. Toàn bộ chuỗi tương tác thể hiện rõ phân tách trách nhiệm giữa lớp endpoint, lớp dịch vụ và lớp lưu trữ, phù hợp kiến trúc FastAPI + SQLAlchemy hiện có.

**Các đối tượng tham gia** được gợi ý khi vẽ biểu đồ như sau. **Actor** là Thiết bị / Fake Device Script. **Boundary** là endpoint `POST /telemetry/` (có thể ghi chú kèm dependency `verify_device`). **Controller / Service** gồm `telemetry_service.create_telemetry` và `alert_service.check_alerts`, cùng các hàm phụ trợ so sánh điều kiện và định dạng tin nhắn. **External System** là Telegram Bot API (URL `api.telegram.org/.../sendMessage`). **Entity** là PostgreSQL, biểu diễn các thao tác ghi đọc bảng `devices`, `telemetry`, `alert_rules`, `alert_history` và cập nhật trạng thái luật khi cần.

**Luồng xử lý chính** diễn ra theo trình tự sau (thể hiện trên trục thời gian từ trên xuống trong biểu đồ trình tự).

**Bước 1.** Thiết bị gửi yêu cầu `POST /telemetry/` tới máy chủ, kèm header `x-device-token` và phần thân JSON có trường `data` chứa các metric đo được.

**Bước 2.** Lớp boundary kích hoạt `verify_device`: truy vấn PostgreSQL theo `device_token`. Nếu không tìm thấy bản ghi khớp, luồng kết thúc sớm với phản hồi lỗi quyền truy cập; nếu khớp, định danh thiết bị được truyền xuống bước xử lý tiếp theo.

**Bước 3.** `telemetry_service.create_telemetry` kiểm tra `data` là đối tượng dictionary; nếu không đúng kiểu, ném lỗi nghiệp vụ và không ghi dữ liệu. Nếu hợp lệ, dữ liệu được chuẩn hóa (`normalize_telemetry_data`) để đảm bảo cấu trúc thống nhất trước khi lưu.

**Bước 4.** Hệ thống tạo entity `Telemetry` mới, thực hiện `add` và `commit` vào PostgreSQL, sau đó `refresh` đối tượng để có định danh và thời điểm tạo bản ghi.

**Bước 5.** Cùng trong ngữ cảnh xử lý yêu cầu, hàm `check_alerts` được gọi với bản ghi telemetry vừa lưu, mở đầu giai đoạn đánh giá cảnh báo.

**Bước 6.** `check_alerts` nạp danh sách luật `enabled` của thiết bị, đọc giá trị metric từ `telemetry.data`, so sánh với ngưỡng theo phép toán đã cấu hình; đồng thời xét các trạng thái kích hoạt ban đầu, nhắc lại theo `cooldown_seconds`, và phục hồi khi giá trị trở về vùng bình thường. Nếu không có luật phù hợp hoặc không cần gửi tin tại thời điểm đó, không phát sinh gọi Telegram.

**Bước 7.** Khi logic cảnh báo yêu cầu gửi tin (kích hoạt mới, nhắc lại khi cảnh báo kéo dài, hoặc thông báo phục hồi), dịch vụ gửi yêu cầu HTTP tới Telegram Bot API. Nếu dịch vụ trả lỗi hoặc không xác nhận thành công, bước ghi lịch sử tương ứng không thực hiện cho lần gửi đó.

**Bước 8.** Nếu gửi Telegram thành công, hệ thống gọi `save_alert` để thêm bản ghi vào `alert_history` (kênh `sent_to` ghi nhận telegram), đồng bộ với cập nhật trạng thái luật trong cùng phiên xử lý.

**Bước 9.** Sau khi hoàn tất xử lý nghiệp vụ, endpoint trả về `TelemetryResponse` cho thiết bị với mã thành công, phản ánh nội dung bản ghi telemetry đã lưu; thiết bị không cần chờ kết quả gửi Telegram để coi yêu cầu gửi dữ liệu là hoàn tất về mặt lưu trữ, song phản hồi vẫn được trả sau khi chuỗi xử lý trong hàm endpoint kết thúc.

Hình 3.3.1 Biểu đồ trình tự cho luồng gửi telemetry và xử lý cảnh báo

### 3.3.2 Biểu đồ trình tự cho luồng người dùng xem dữ liệu giám sát

Luồng thứ hai mô tả tương tác của **người dùng đã đăng ký** thông qua ứng dụng web React, với hai vai trò **Owner** hoặc **Viewer** đối với từng thiết bị. Khác với luồng thiết bị, mọi gọi API từ trình duyệt đều đính kèm **JWT** do backend cấp sau đăng nhập. Ranh giới giao diện được thể hiện qua các trang `LoginPage`, `DashboardPage` và `DeviceOverviewPage` (cùng các layout định tuyến trong `AppRoutes`), nơi người dùng thao tác và ứng dụng gọi dịch vụ REST qua axios. Phía máy chủ, các route trong `auth_routes` phục vụ xác thực; `device_routes` cung cấp danh sách thiết bị và các endpoint con telemetry khi đã xác định `device_id`; dependency `device_permission` đảm bảo chỉ owner hoặc viewer hợp lệ mới truy cập được tài nguyên. **Entity** PostgreSQL chịu trách nhiệm truy vấn bảng `devices`, `device_viewers`, `telemetry` và các bảng liên quan phục vụ thống kê. Kết quả trả về được render thành **biểu đồ Recharts** và **bảng** trong `DeviceOverviewPage`, đồng thời trang dashboard có thể tải thêm dữ liệu tóm tắt (ví dụ telemetry mới nhất, thông tin phục vụ thẻ tổng quan) theo logic `DashboardPage`.

**Luồng xử lý chính** được mô tả theo trình tự sau để dựng biểu đồ trình tự.

**Bước 1.** Người dùng nhập thông tin trên `LoginPage` và gửi yêu cầu đăng nhập tới endpoint xác thực của backend.

**Bước 2.** `auth_routes` xử lý đăng nhập, kiểm tra tài khoản và trả về JWT cho frontend; ứng dụng lưu token phục vụ các lần gọi API sau (theo cơ chế đã triển khai trong `AuthContext` và client axios).

**Bước 3.** Sau khi đăng nhập, người dùng mở `DashboardPage` (hoặc điều hướng tới khu vực danh sách thiết bị); ứng dụng gửi `GET /devices/` kèm header ủy quyền.

**Bước 4.** Backend áp dụng `get_current_user`, sau đó `device_service.get_devices_by_user` truy vấn PostgreSQL để trả về các thiết bị mà người dùng là chủ sở hữu hoặc được ghi nhận là viewer, phù hợp mô hình dữ liệu `Device` và `DeviceViewer`.

**Bước 5.** Người dùng chọn một thiết bị trên giao diện; router chuyển tới `DeviceOverviewPage` với `device_id` tương ứng.

**Bước 6.** Trang chi tiết, thông qua các hook `useTelemetry` và `useTelemetryStats`, phát sinh một hoặc nhiều yêu cầu tới `GET /devices/{device_id}/telemetry` (có tham số giới hạn và khoảng thời gian) và `GET /devices/{device_id}/telemetry/stats` (tham số `metric`), đồng thời có thể tải thêm dữ liệu phụ trợ như danh sách luật cảnh báo tùy cấu hình trang.

**Bước 7.** Với mỗi endpoint gắn `device_id`, backend áp dụng `device_permission`: so khớp `owner_id` hoặc kiểm tra quan hệ viewer trong cơ sở dữ liệu; nếu không thỏa, trả về lỗi 403 và luồng hiển thị dừng ở phía client với thông báo phù hợp.

**Bước 8.** Khi được phép, các hàm trong `telemetry_service` truy vấn PostgreSQL: lấy danh sách bản ghi telemetry theo điều kiện lọc, hoặc tổng hợp min/max/avg theo metric trên tập bản ghi gần đây như đã cài đặt.

**Bước 9.** Dữ liệu JSON trả về được nhận tại frontend, đưa vào trạng thái component và chuẩn bị cho hiển thị.

**Bước 10.** `DeviceOverviewPage` kết xuất **Recharts** (một hoặc nhiều metric) và **TelemetryTable** (hoặc chế độ xem tương đương) dựa trên dữ liệu đã tải; người dùng có thể đổi metric, đổi khoảng thời gian hoặc chế độ xem, khi đó lặp lại các bước gọi API tương ứng mà không cần đăng nhập lại nếu token còn hiệu lực.

Như vậy, biểu đồ trình tự cho luồng xem giám sát làm rõ vai trò của **tầng giao diện React**, **các router FastAPI** và **PostgreSQL** trong cùng một phiên làm việc có xác thực, đồng thời thể hiện điểm kiểm soát quyền truy cập theo thiết bị trước khi dữ liệu telemetry được đọc ra ngoài.

Hình 3.3.2 Biểu đồ trình tự cho luồng người dùng xem dữ liệu giám sát

## 3.4 Biểu đồ lớp phân tích (Class Diagram)

### 1. Mục tiêu

Biểu đồ lớp phân tích (Analysis Class Diagram) nhằm cố định **các khái niệm nghiệp vụ** và **cấu trúc tĩnh** của hệ thống ở mức trừu tượng hợp lý, làm cầu nối giữa yêu cầu chức năng đã mô tả ở các mục trước với thiết kế triển khai cụ thể trong mã nguồn và cơ sở dữ liệu. Trong phạm vi đồ án **IoT Device Platform**, mục tiêu của mục 3.4 là nhóm các thành phần theo các lớp kiểu **boundary** (ranh giới tương tác), **controller/service** (điều phối và nghiệp vụ) và **entity** (dữ liệu bền vững ánh xạ PostgreSQL), từ đó làm rõ trách nhiệm từng phần và quan hệ kết hợp, kế thừa hoặc phụ thuộc giữa chúng. Việc đối chiếu trực tiếp với các module FastAPI, dịch vụ trong `app/services`, model SQLAlchemy trong `app/models` và các trang React trong `frontend/src/pages` giúp biểu đồ không chỉ mang tính minh họa mà còn phản ánh **kiến trúc thực tế** của dự án.

### 2. Phân loại lớp trong hệ thống

#### a) Boundary classes (lớp ranh giới)

Lớp ranh giới đảm nhận vai trò **tiếp nhận tương tác** từ người dùng hoặc từ client bên ngoài và **chuyển tiếp** yêu cầu vào tầng xử lý. Trên **frontend**, các trang React đóng vai trò boundary theo từng khu vực chức năng: `LoginPage` và `RegisterPage` phục vụ xác thực; `DashboardPage` hiển thị tổng quan; `DeviceListPage` liệt kê thiết bị; `DeviceOverviewPage` là trung tâm theo dõi telemetry (biểu đồ Recharts, bảng dữ liệu); `DeviceAttributesPage`, `DeviceViewersPage`, `DeviceAlertHistoryPage` lần lượt phục vụ thuộc tính, người xem và lịch sử cảnh báo theo thiết bị; `AlertsPage` tổng hợp cảnh báo trên phạm vi ứng dụng. Client HTTP (`axios`) kết nối các boundary này với máy chủ. Trên **backend**, ranh giới được thể hiện qua các module định tuyến REST: `auth_routes` (tiền tố `/auth`), `device_routes` (tiền tố `/devices`, gồm cả endpoint telemetry lồng theo thiết bị), `telemetry_routes` (tiền tố `/telemetry` cho thiết bị đẩy dữ liệu), `alert_routes` (tiền tố `/alert-rules`), cùng `users_routes` phục vụ tra cứu người dùng khi cấu hình viewer. Các dependency như `verify_device` hoặc `get_current_user` gắn kèm boundary phía máy chủ để áp dụng quy tắc truy cập trước khi gọi dịch vụ.

#### b) Controller / Service classes (lớp điều phối và nghiệp vụ)

Tầng nghiệp vụ trong dự án được tổ chức chủ yếu dưới dạng **module dịch vụ** Python, được gọi từ các hàm endpoint thay vì một lớp “Controller” độc lập theo nghĩa MVC cổ điển; song về mặt phân tích, có thể quy ước các module này tương ứng với **lớp điều khiển/dịch vụ**. Cụ thể, `user_service` đảm nhiệm đăng ký, xác thực mật khẩu và phục vụ luồng đăng nhập phối hợp với `create_access_token` trong `app/utils/auth`; `device_service` thực hiện tạo, liệt kê, xóa thiết bị, quản lý viewer và truy vấn theo quyền; `telemetry_service` chuẩn hóa và lưu telemetry, truy vấn lịch sử, bản ghi mới nhất và tính thống kê theo metric; `alert_service` quản lý luật cảnh báo, thực hiện `check_alerts` sau mỗi lần ghi telemetry, điều phối gửi tin qua `telegram_service`; `telegram_service` đóng gói gọi HTTPS tới Telegram Bot API. Phân quyền **owner/viewer** không tách thành một lớp `PermissionService` riêng trong mã nguồn mà được tập trung trong dependency `device_permission` (module `dependencies/permission.py`) kết hợp `device_service`, thể hiện trách nhiệm kiểm soát truy cập theo thiết bị. Như vậy, nhóm “controller/service” trong biểu đồ phân tích phản ánh **các gói nghiệp vụ** và **điểm gắn dependency** đã triển khai, thay vì đặt tên lớp giả định không xuất hiện trong kho mã.

#### c) Entity classes (lớp thực thể)

Lớp thực thể tương ứng trực tiếp với các **model SQLAlchemy** ánh xạ bảng trong PostgreSQL, là nơi lưu trữ bền vững dữ liệu người dùng, thiết bị, telemetry và cảnh báo. Các entity cốt lõi gồm `User`, `Device`, `DeviceViewer`, `Telemetry`, `AlertRule` và `AlertHistory`, được định nghĩa trong thư mục `app/models`. Mỗi entity mang một tập thuộc tính và khóa ngoại thể hiện quan hệ; chi tiết được tóm tắt dưới đây để phục vụ vẽ biểu đồ lớp và đối chiếu với sơ đồ cơ sở dữ liệu.

**User** lưu thông tin tài khoản: `id`, `username` (duy nhất), `email`, `password_hash`, `telegram_chat_id` (tuỳ chọn), `created_at`. Entity này là tham chiếu cho chủ sở hữu thiết bị và cho các bản ghi viewer.

**Device** mô tả thiết bị IoT: `id`, `imei` (duy nhất), `name`, `description`, `owner_id` (khóa ngoại tới `users.id`), `device_token` (bí mật gửi telemetry), `created_at`. Đây là trung tâm kết nối telemetry, luật cảnh báo và quan hệ xem chung.

**DeviceViewer** thể hiện quan hệ nhiều–nhiều được chuẩn hóa giữa người dùng và thiết bị khi vai trò là người xem: `id`, `device_id`, `user_id`, `created_at`.

**Telemetry** lưu chuỗi đo theo thời gian: `id` (kiểu lớn), `device_id`, `data` (JSON chứa các metric), `created_at`.

**AlertRule** cấu hình cảnh báo theo metric: `id`, `device_id`, `metric_name`, `condition` (chuỗi toán tử so sánh, ví dụ `>`, `<`), `threshold`, `message`, `enabled`, `cooldown_seconds`, `last_triggered_at`, `is_triggered`.

**AlertHistory** ghi nhận các lần gửi cảnh báo: `id`, `device_id`, `rule_id`, `message`, `sent_to` (ví dụ `telegram`), `sent_at`.

Các entity trên cùng với ràng buộc khóa ngoại trong PostgreSQL tạo thành **khung dữ liệu** mà tầng service thao tác thông qua SQLAlchemy Session.

### 3. Quan hệ giữa các lớp

Ở mức phân tích, quan hệ giữa **entity** tuân theo mô hình quan hệ đã cài đặt: một **User** có thể sở hữu nhiều **Device** thông qua `owner_id`; một **Device** có nhiều **Telemetry**, nhiều **AlertRule**, và nhiều **DeviceViewer**. Một **User** có thể xuất hiện trong nhiều **DeviceViewer** ở vai trò người được cấp quyền xem. Một **AlertRule** sinh ra nhiều **AlertHistory** theo thời gian. Quan hệ giữa **boundary** và **service** là phụ thuộc gọi hàm: trang React và route FastAPI khởi phát yêu cầu, service thực hiện nghiệp vụ và thao tác entity. Quan hệ giữa **service** và **entity** là thao tác đọc/ghi qua ORM (thêm, truy vấn, cập nhật). Để tổng hợp trực quan cho báo cáo, bảng sau mô tả các cặp thành phần tiêu biểu và ý nghĩa quan hệ (có thể dùng làm chú thích khi vẽ biểu đồ lớp).

| Thành phần nguồn | Thành phần đích | Quan hệ (UML gợi ý) | Mô tả |
|------------------|-----------------|----------------------|--------|
| User | Device | Một–nhiều (1 → 0..\*) | Mỗi bản ghi `Device` tham chiếu `owner_id` tới một người dùng; một người dùng có thể sở hữu nhiều thiết bị. |
| User | DeviceViewer | Một–nhiều (1 → 0..\*) | Mỗi `DeviceViewer` có `user_id`; một người dùng có thể là viewer của nhiều thiết bị. |
| Device | DeviceViewer | Một–nhiều (1 → 0..\*) | Một thiết bị có thể có nhiều viewer qua các bản ghi trung gian. |
| Device | Telemetry | Một–nhiều (1 → 0..\*) | Mỗi bản ghi telemetry gắn `device_id`. |
| Device | AlertRule | Một–nhiều (1 → 0..\*) | Luật cảnh báo được định nghĩa theo từng thiết bị. |
| AlertRule | AlertHistory | Một–nhiều (1 → 0..\*) | Mỗi lần ghi lịch sử tham chiếu `rule_id` (và `device_id`). |
| Trang React (boundary) | Module `*_routes` / axios | Phụ thuộc / gọi | Giao diện gửi HTTP tới API; không chứa logic nghiệp vụ cốt lõi. |
| Module `*_routes` (boundary) | `*_service`, dependencies | Phụ thuộc / gọi | Endpoint gọi hàm dịch vụ và dependency xác thực, phân quyền. |
| `telemetry_routes` | `verify_device`, `telemetry_service` | Phụ thuộc | Nhận telemetry từ thiết bị, xác thực token rồi lưu và kích hoạt cảnh báo. |
| `device_routes` (telemetry con) | `device_permission`, `telemetry_service` | Phụ thuộc | Truy vấn telemetry/stats sau khi kiểm tra owner/viewer. |
| `alert_service` | `telegram_service`, entity `AlertRule`, `AlertHistory` | Phụ thuộc | Đánh giá luật, gửi Telegram, ghi lịch sử khi gửi thành công. |
| `telemetry_service` | entity `Telemetry`, `alert_service` | Phụ thuộc | Lưu telemetry rồi gọi `check_alerts`. |
| `device_permission` | `device_service`, entity `Device`, `DeviceViewer` | Phụ thuộc | Xác định quyền truy cập thiết bị cho người dùng hiện tại. |

Trong biểu đồ lớp triển khai chi tiết, có thể bổ sung các **schema Pydantic** (`app/schemas`) như lớp DTO tương tác với boundary, song ở mức phân tích hiện tại, việc gắn entity–service–route đã đủ làm rõ kiến trúc tổng thể.

### 4. Kết luận mục 3.4

Biểu đồ lớp phân tích của **IoT Device Platform** khái quát hóa ba tầng **ranh giới – dịch vụ – thực thể** tương ứng với cách tổ chức mã nguồn FastAPI + SQLAlchemy + React hiện có. Việc neo entity vào các bảng PostgreSQL (`users`, `devices`, `device_viewers`, `telemetry`, `alert_rules`, `alert_history`) giúp biểu đồ không chỉ phục vụ trình bày luận văn mà còn **hỗ trợ đối chiếu thiết kế cơ sở dữ liệu** với lớp ORM và với các truy vấn trong service. Đồng thời, việc xác định boundary ở cả trang web và module route làm rõ **điểm vào hệ thống** và luồng phụ thuộc tới tầng nghiệp vụ, tạo cơ sở cho việc bảo trì mã nguồn, mở rộng endpoint hoặc bổ sung thực thể mới mà vẫn giữ nhất quán với mô hình dữ liệu trung tâm. Do đó, mục 3.4 khép lại phần phân tích hành vi–cấu trúc ở Chương 3 bằng một lớp trừu tượng **ổn định** và **bám sát triển khai thực tế** của đề tài.

# CHƯƠNG 4 THIẾT KẾ HỆ THỐNG

Chương này trình bày thiết kế của **IoT Device Platform** ở mức kiến trúc và chi tiết triển khai, bám sát mã nguồn backend FastAPI, frontend React và cơ sở dữ liệu PostgreSQL hiện có. Nội dung gồm kiến trúc tổng thể dạng client–server, thiết kế dữ liệu và tầng nghiệp vụ, thiết kế giao diện người dùng, cùng các biện pháp bảo mật và phân quyền đã áp dụng. Các phần gợi ý chèn hình minh họa được đánh dấu rõ để người soạn báo cáo bổ sung ảnh chụp màn hình hoặc sơ đồ khi hoàn thiện bản in.

## 4.1 Kiến trúc tổng thể hệ thống

### 4.1.1 Mô hình client–server và phân tầng logic

Hệ thống được tổ chức theo mô hình **client–server**: phía **client** là ứng dụng web một trang (SPA) chạy trên trình duyệt, đóng vai trò giao diện người dùng và gọi API qua giao thức HTTP; phía **server** là dịch vụ backend cung cấp REST API, xử lý nghiệp vụ, xác thực và truy cập cơ sở dữ liệu. Luồng dữ liệu tiêu biểu gồm hai hướng: (1) thiết bị IoT hoặc script giả lập **đẩy telemetry** lên endpoint nhận dữ liệu; (2) người dùng đã đăng nhập **kéo dữ liệu giám sát** và cấu hình thiết bị thông qua các endpoint có bảo vệ JWT. Việc tách biệt client và server giúp đội phát triển có thể triển khai, mở rộng và bảo trì từng phần độc lập: frontend có thể thay đổi giao diện mà không đổi hợp đồng API; backend có thể tối ưu truy vấn và chính sách bảo mật mà không phụ thuộc chi tiết render trên trình duyệt.

### 4.1.2 Các lớp kiến trúc chính

**Lớp trình diễn (Presentation — Frontend).** Ứng dụng được xây dựng bằng **React** và công cụ build **Vite**, tổ chức theo trang (`pages`), bố cục (`layouts`), thành phần tái sử dụng (`components`) và hook gọi dữ liệu (`hooks`). Kiểu dáng giao diện sử dụng **Tailwind CSS** để đảm bảo bố cục thống nhất và đáp ứng nhanh trên các kích thước màn hình phổ biến. Dữ liệu từ server được lấy qua thư viện **axios** với header ủy quyền khi cần; dữ liệu chuỗi thời gian được trực quan hóa bằng **Recharts**. Lớp này không lưu trữ dữ liệu nghiệp vụ cốt lõi mà phản ánh trạng thái phiên làm việc và dữ liệu nhận về từ API.

**Lớp ứng dụng và truy cập dữ liệu (Application — Backend).** Máy chủ được triển khai bằng **FastAPI** trên ASGI server **Uvicorn**. Các endpoint được nhóm trong các module **router** (`auth_routes`, `device_routes`, `telemetry_routes`, `alert_routes`, `users_routes`). Logic nghiệp vụ tách vào các module **service** (`user_service`, `device_service`, `telemetry_service`, `alert_service`) và tích hợp gửi tin qua **telegram_service**. Truy cập cơ sở dữ liệu thực hiện qua **SQLAlchemy ORM** với mô hình lớp trong `app/models`. Các dependency như `get_current_user`, `device_permission`, `verify_device` đóng vai trò **kiểm soát truy cập** trước khi thực thi hàm xử lý chính. FastAPI còn cấu hình **CORSMiddleware** cho phép nguồn gốc frontend phát triển cục bộ gọi API kèm thông tin xác thực theo chính sách đã định.

**Lớp lưu trữ (Data — Database).** **PostgreSQL** đóng vai trò hệ quản trị cơ sở dữ liệu quan hệ, lưu trữ người dùng, thiết bị, quan hệ viewer, telemetry dạng JSON, luật cảnh báo và lịch sử cảnh báo. Schema khởi tạo khi ứng dụng khởi động thông qua `Base.metadata.create_all` trong mã nguồn hiện tại; trong môi trường sản xuất có thể bổ sung công cụ migration (ví dụ Alembic) theo hướng phát triển đã ghi trong README.

### 4.1.3 Sơ đồ kiến trúc tổng thể

Hình minh họa kiến trúc tổng thể được lưu tại `docs/kientruc_png/architecture_overview.png`. Các nhãn trên hình dùng **tiếng Anh** để tránh sai sót chính tả khi in và thuận tiện trích dẫn trong tài liệu kỹ thuật; nội dung tương ứng với mô tả tiếng Việt ở các mục 4.1.1 và 4.1.2.

![Hình 4.1 – Sơ đồ kiến trúc tổng thể (nhãn tiếng Anh)](kientruc_png/architecture_overview.png)

Bản mô tả song song bằng ký hiệu văn bản (ASCII) giữ nguyên để đối chiếu nhanh khi chỉnh sửa báo cáo dạng văn bản thuần:

```text
+------------------+       HTTPS/HTTP        +---------------------------+
|  Browser         |  JWT / REST (axios)     |  Backend FastAPI (Uvicorn) |
|  React + Vite    | --------------------->  |  Routers + Services        |
|  Tailwind +      | <---------------------  |  Dependencies (auth,     |
|  Recharts        |       JSON              |  device_permission)      |
+------------------+                         +-------------+--------------+
        ^                                                  |
        | User UI                                          | SQLAlchemy
        v                                                  v
 [Device / Fake script] --POST /telemetry/ (x-device-token) --> PostgreSQL
        |                                                  ^
        +------------------------ Telegram Bot API (HTTPS) -+
                               (httpx / telegram_service)
```

## 4.2 Thiết kế chi tiết hệ thống

### 4.2.1 Mô hình cơ sở dữ liệu và quan hệ thực thể (ERD)

Thiết kế dữ liệu xoay quanh thực thể **User** và **Device**. Một người dùng có thể sở hữu nhiều thiết bị thông qua khóa ngoại `owner_id` trên bảng `devices`. Quan hệ **nhiều–nhiều** giữa người dùng và thiết bị ở vai trò “người xem” được thể hiện bằng bảng trung gian **DeviceViewer** (`device_viewers`), gồm `device_id` và `user_id`. Mỗi thiết bị sinh ra nhiều bản ghi **Telemetry** (`telemetry`) chứa trường JSON `data`; đồng thời có nhiều **AlertRule** (`alert_rules`) định nghĩa điều kiện cảnh báo theo metric. Khi có sự kiện gửi tin cảnh báo thành công, hệ thống ghi **AlertHistory** (`alert_history`) tham chiếu `rule_id` và `device_id`. Ngoài ra, thực thể **DeviceAttribute** (`device_attributes`) lưu các cặp tên–giá trị mô tả bổ sung cho thiết bị (ví dụ nhãn vị trí, ghi chú vận hành), liên kết `device_id` tới `devices`.

Về mặt khóa chính, `telemetry.id` sử dụng kiểu số nguyên lớn (`BigInteger`) phù hợp khối lượng bản ghi tăng dần; các bảng còn lại dùng khóa số nguyên tăng. Thời gian tạo bản ghi sử dụng `TIMESTAMP` với mặc định theo máy chủ cơ sở dữ liệu khi phù hợp.

Hình ERD minh họa (nhãn tiếng Anh, file `docs/images/erd_database.png`):

![Hình 4.2 – Mô hình cơ sở dữ liệu (ERD)](images/erd_database.png)

#### Ví dụ cấu trúc payload telemetry (JSON)

Trường `data` trong bảng `telemetry` là đối tượng JSON linh hoạt; ứng dụng chuẩn hóa nhẹ qua `normalize_telemetry_data`. Ví dụ minh họa một bản ghi đo nhiệt độ và độ ẩm:

```json
{
  "temperature": 27.4,
  "humidity": 62.1
}
```

Khi đánh giá cảnh báo, `alert_service` đọc giá trị theo `metric_name` đã cấu hình trong luật (ví dụ `temperature`) và so sánh với `threshold` theo `condition` (`>`, `<`, `>=`, `<=`, `==`).

#### Ví dụ bảng dữ liệu tóm tắt (minh họa)

| Bảng | Khóa / trường tiêu biểu | Ý nghĩa |
|------|-------------------------|---------|
| `users` | `id`, `username`, `email`, `password_hash` | Tài khoản đăng nhập web |
| `devices` | `id`, `imei`, `owner_id`, `device_token` | Thiết bị và token gửi telemetry |
| `device_attributes` | `device_id`, `attribute_name`, `attribute_value` | Thuộc tính mô tả thiết bị |
| `telemetry` | `device_id`, `data` (JSON), `created_at` | Chuỗi đo theo thời gian |
| `alert_rules` | `device_id`, `metric_name`, `condition`, `threshold`, `cooldown_seconds` | Luật cảnh báo |
| `alert_history` | `rule_id`, `message`, `sent_to`, `sent_at` | Lịch sử gửi cảnh báo |

### 4.2.2 Thiết kế tầng xử lý nghiệp vụ Backend

Trong tài liệu mẫu theo kiểu MVC, người ta thường nhắc tới **Controller** tách khỏi **Service**. Trong triển khai hiện tại của đề tài, FastAPI không bắt buộc một lớp “Controller” đặt tên cố định; thay vào đó, **module router** đóng vai trò **điểm vào HTTP** và gọi trực tiếp **service** cùng các **dependency** xác thực. Để thuận tiện đối chiếu với mẫu báo cáo, bảng dưới đây quy ước tên gọi gợi nhớ và chỉ ra module tương ứng trong mã nguồn.

| Tên gọi gợi nhớ (theo mẫu) | Module / thành phần thực tế | Nhiệm vụ chính |
|---------------------------|-----------------------------|----------------|
| AuthController | `auth_routes` + `user_service`, `create_access_token` | Đăng ký, đăng nhập, cấp JWT |
| DeviceController | `device_routes` + `device_service`, `device_attribute_service` | CRUD thiết bị (theo quyền), thuộc tính, viewer, endpoint telemetry con |
| TelemetryController | `telemetry_routes` + `telemetry_service` | Thiết bị gửi telemetry; `verify_device` |
| AlertController | `alert_routes` + `alert_service` | Tạo/cập nhật luật, lấy lịch sử cảnh báo |
| UsersController (phụ trợ) | `users_routes` + `user_service.list_users_public` | Danh sách user rút gọn phục vụ chọn viewer |

**Models (ORM)** nằm trong `app/models`, ánh xạ bảng PostgreSQL. **Schemas (Pydantic)** trong `app/schemas` định nghĩa cấu trúc đầu vào/đầu ra của API. **Middleware** trong dự án chủ yếu là **CORSMiddleware** toàn cục trong `main.py`; xác thực JWT và phân quyền thiết bị được thực hiện qua **Depends** trên từng route thay vì một middleware xác thực duy nhất bao phủ mọi đường dẫn.

### 4.2.3 Cơ chế kiểm tra luật cảnh báo, gửi Telegram và chống gửi trùng

Sau mỗi lần `telemetry_service.create_telemetry` lưu thành công bản ghi mới, hàm `alert_service.check_alerts` được gọi với đối tượng telemetry vừa tạo. Quy trình nội bộ lần lượt: (1) nạp các **AlertRule** có `enabled = true` của thiết bị; (2) đọc giá trị metric từ `telemetry.data`; (3) đánh giá điều kiện so với `threshold`; (4) tùy trạng thái `is_triggered` và thời điểm `last_triggered_at`, quyết định gửi tin **kích hoạt mới**, **nhắc lại** khi cảnh báo vẫn tồn tại sau khoảng **cooldown**, hoặc tin **phục hồi** khi giá trị trở về vùng bình thường. Việc gửi tin thực hiện qua `telegram_service.send_telegram_message` (HTTP POST tới Telegram Bot API). Chỉ khi gửi thành công, hệ thống gọi `save_alert` để ghi **AlertHistory** với `sent_to` ghi nhận kênh `telegram`.

**Cơ chế chống spam** không dựa trên gửi tin lặp lại mỗi lần đọc được giá trị vượt ngưỡng, mà kết hợp: (a) chỉ gửi khi **chuyển trạng thái** hoặc khi **đủ thời gian chờ** so với lần gửi trước (cooldown); (b) nếu gửi Telegram thất bại thì **không** ghi lịch sử cho lần đó, tránh ghi nhận sự kiện không tới được người nhận. Như vậy, thiết kế cân bằng giữa **kịp thời thông báo** và **giảm tải tin nhắn** trên kênh ngoài.

### 4.2.4 Thiết kế giao diện người dùng Frontend

Giao diện được tổ chức theo **layout** chung (`MainLayout`, `AuthLayout`, `DeviceLayout`) và **định tuyến** trong `AppRoutes`. Các route được bảo vệ bằng `ProtectedRoute`: nếu chưa đăng nhập thì chuyển hướng về trang đăng nhập. Dưới đây là mô tả các trang chính; mỗi mục ghi nhận chức năng, bố cục, thành phần chính và cách người dùng tương tác. Các vị trí cần chèn ảnh màn hình được đánh dấu để bổ sung khi hoàn thiện báo cáo Word.

#### Trang Dashboard (`DashboardPage`)

Trang tổng quan sau đăng nhập, hiển thị **số lượng thiết bị**, tổng hợp **cảnh báo** (theo dữ liệu tải kèm từ API) và danh sách thiết bị dạng thẻ (`DashboardDeviceSummaryCard`). Người dùng có thể điều hướng nhanh tới chi tiết thiết bị. Layout sử dụng khung `MainLayout` với tiêu đề và vùng nội dung rộng.

**[Hình 4.3 – Chèn ảnh chụp màn hình trang Dashboard.]**

#### Trang danh sách thiết bị (`DeviceListPage`)

Liệt kê thiết bị mà người dùng có quyền (sở hữu hoặc xem), thường kèm thao tác điều hướng tới chi tiết. Người dùng **chọn một thiết bị** để vào luồng giám sát chi tiết. Thành phần giao diện có thể gồm thẻ thiết bị (`DeviceCard`) và liên kết định tuyến.

**[Hình 4.4 – Chèn ảnh chụp màn hình trang danh sách thiết bị.]**

#### Trang tổng quan thiết bị — Device Overview (`DeviceOverviewPage`)

Đây là trang trung tâm của **giám sát**: hiển thị **biểu đồ** (Recharts: `TelemetryChart`, `TelemetryMultiChart`), **bảng** (`TelemetryTable`), **chọn metric** (`MetricSelector`), **thống kê** theo metric qua hook `useTelemetryStats`, và bảng luật cảnh báo (`AlertRulesPanel`). Người dùng có thể đổi khoảng thời gian xem (`rangePreset`), chuyển chế độ biểu đồ/bảng, và làm mới dữ liệu. Layout sử dụng `DeviceLayout` với thanh điều hướng con (`DeviceSubNav`) giữa các mục con của thiết bị.

**[Hình 4.5 – Chèn ảnh chụp màn hình Device Overview (biểu đồ + bảng).]**

#### Trang cảnh báo tổng (`AlertsPage`)

Tập trung theo dõi **luật cảnh báo** và **lịch sử** trên phạm vi ứng dụng (theo cách tổ chức hiện có trong mã nguồn), giúp người dùng tra cứu nhanh các sự kiện đã ghi nhận mà không cần vào từng thiết bị.

**[Hình 4.6 – Chèn ảnh chụp màn hình trang Alerts.]**

#### Trang thuộc tính thiết bị (`DeviceAttributesPage`)

Cho phép **xem** danh sách thuộc tính; **thêm/xóa** thuộc tính thường chỉ dành cho **chủ sở hữu** (theo quyền API). Giao diện trình bày dạng danh sách hoặc bảng, có nút thao tác tương ứng quyền `isOwner` từ ngữ cảnh layout.

**[Hình 4.7 – Chèn ảnh chụp màn hình trang thuộc tính thiết bị.]**

#### Trang người xem thiết bị (`DeviceViewersPage`)

Hiển thị **danh sách viewer** và cho phép **thêm/gỡ** viewer khi người dùng là owner; viewer chỉ được xem danh sách. Người dùng chọn tài khoản từ danh sách người dùng công khai do backend cung cấp khi cần.

**[Hình 4.8 – Chèn ảnh chụp màn hình trang quản lý viewer.]**

#### Trang lịch sử cảnh báo theo thiết bị (`DeviceAlertHistoryPage`)

Hiển thị **lịch sử cảnh báo** theo `device_id`, bổ trợ cho việc đối chiếu sau khi Telegram đã gửi tin.

**[Hình 4.9 – Chèn ảnh chụp màn hình lịch sử cảnh báo theo thiết bị.]**

Ngoài các trang trên, luồng **đăng nhập / đăng ký** (`LoginPage`, `RegisterPage`) sử dụng `AuthLayout`, tập trung biểu mẫu nhập liệu và chuyển hướng sau khi xác thực thành công.

## 4.3 Bảo mật và phân quyền

### 4.3.1 Xác thực JWT

Người dùng web sau khi đăng nhập nhận **JWT** do backend tạo bằng thư viện `jose`, thuật toán **HS256**, payload chứa `user_id` và thời hạn `exp` (ví dụ 24 giờ trong `create_access_token`). Các endpoint cần bảo vệ sử dụng `HTTPBearer` qua dependency `get_current_user`: token được giải mã, người dùng được tải từ cơ sở dữ liệu; nếu token không hợp lệ hoặc không tìm thấy user thì trả lỗi 401. Frontend đính kèm token trong header `Authorization` khi gọi axios. Thiết kế này tách **xác thực có trạng thái** ra khỏi server theo hướng stateless, phù hợp mô hình REST.

Cần lưu ý: trong mã nguồn hiện tại, **SECRET_KEY** dùng ký JWT được khai báo cố định trong module tiện ích; báo cáo README cũng gợi ý đưa secret ra biến môi trường khi triển khai thực tế. Đây là điểm cần cải thiện khi chuyển sang môi trường sản xuất.

### 4.3.2 Phân quyền truy cập theo thiết bị

Hệ thống phân định quyền trên tài nguyên thiết bị theo hai vai trò chính: **Owner** (chủ sở hữu, `devices.owner_id` trùng `user.id`) và **Viewer** (có bản ghi trong `device_viewers`). Dependency `device_permission` kiểm tra: nếu người dùng là owner thì cho phép; nếu không, với chế độ `viewer` thì kiểm tra quan hệ viewer; với thao tác yêu cầu `owner` (xóa thiết bị, thêm thuộc tính, thêm/gỡ viewer, tạo/sửa luật cảnh báo theo route) thì chỉ owner mới đạt. **Không có vai trò “admin” toàn hệ thống** được mô hình hóa riêng trong phiên bản mã nguồn hiện tại; mọi quyền đều gắn với sở hữu thiết bị hoặc được mời xem.

Thiết bị gửi telemetry **không** dùng JWT người dùng mà dùng **`x-device-token`**; đây là kênh xác thực riêng, tránh lẫn lộn với phiên người dùng web.

### 4.3.3 Bảo vệ dữ liệu và mật khẩu

Mật khẩu đăng ký được **băm** bằng **passlib** với scheme **pbkdf2_sha256**, không lưu plaintext trong cơ sở dữ liệu. Khi đăng nhập, hệ thống so khớp băm an toàn. Dữ liệu telemetry lưu dạng JSON có thể chứa thông tin nhạy cảm tùy ứng dụng triển khai; thiết kế khuyến nghị áp dụng **HTTPS** cho cả API và trang web khi triển khai công khai, đồng thời bảo vệ `device_token` và JWT khỏi lộ trên log hoặc mã nguồn client.

### 4.3.4 Gợi ý triển khai an toàn hơn

Ngoài việc chuyển secret JWT và cấu hình Telegram sang biến môi trường, có thể bổ sung chính sách **CORS** chặt chẽ theo miền triển khai thực tế, giới hạn tốc độ gọi API (rate limiting) ở mức reverse proxy, và sao lưu định kỳ cơ sở dữ liệu. Các hướng này nằm ngoài phạm vi tối thiểu của đồ án nhưng là bước tự nhiên khi đưa hệ thống ra môi trường vận hành thật.

---

Kết luận chương: Chương 4 đã trình bày **thiết kế kiến trúc tổng thể** client–server, **mô hình dữ liệu** và **luồng nghiệp vụ** backend–frontend của **IoT Device Platform**, đồng thời làm rõ **cơ chế bảo mật và phân quyền** phù hợp mã nguồn hiện có. Các hình minh họa được đánh dấu theo mục để người soạn báo cáo chèn sơ đồ và ảnh chụp màn hình tương ứng khi hoàn thiện bản in.

# CHƯƠNG 5 CÀI ĐẶT VÀ THỬ NGHIỆM HỆ THỐNG

Chương này trình bày quy trình **triển khai môi trường phát triển và thử nghiệm** cho hệ thống **IoT Device Platform**, bám sát hướng dẫn trong kho mã nguồn và kết quả quan sát khi vận hành các chức năng chính. Nội dung gồm lựa chọn công cụ và công nghệ kèm lý do, mô tả môi trường phần cứng–phần mềm và cấu hình kết nối, sau đó là kịch bản thử nghiệm chức năng, giao diện và API, kết hợp chú thích vị trí chèn hình minh họa cho báo cáo in.

## 5.1 Công cụ và công nghệ sử dụng

### 5.1.1 Nền tảng phát triển ứng dụng

**FastAPI** được chọn làm framework backend vì phù hợp mô hình **REST API** hiện đại, hỗ trợ khai báo tham số và schema rõ ràng nhờ **Pydantic**, tự động sinh tài liệu API và tích hợp **dependency injection** cho xác thực và phân quyền. So với một số framework đồng bộ truyền thống, FastAPI chạy trên **ASGI** cùng **Uvicorn**, cho phép xử lý đồng thời nhiều yêu cầu I/O-bound (gọi cơ sở dữ liệu, gọi Telegram) với hiệu năng phù hợp bài toán IoT nhận telemetry theo chu kỳ.

**SQLAlchemy** đóng vai trò **ORM**, giúp ánh xạ bảng PostgreSQL sang lớp model Python, tách câu lệnh SQL thô khỏi logic nghiệp vụ và giảm lỗi khi thay đổi schema ở mức có kiểm soát. Kết hợp driver **psycopg2-binary**, kết nối tới **PostgreSQL**—hệ quản trị quan hệ mạnh, phù hợp dữ liệu có cấu trúc (người dùng, thiết bị) đồng thời hỗ trợ kiểu **JSON** cho payload telemetry linh hoạt.

**Uvicorn** là ASGI server dùng để chạy ứng dụng FastAPI trong môi trường phát triển (`--reload` hỗ trợ tải lại mã khi chỉnh sửa) và có thể dùng tương tự trong triển khai nhỏ; đây là thành phần “mặc định” được cộng đồng FastAPI khuyến nghị.

### 5.1.2 Giao diện người dùng và trực quan hóa

**React** kết hợp **Vite** tạo trải nghiệm phát triển nhanh (hot reload), đồng thời tách rõ tầng giao diện khỏi backend. **Tailwind CSS** giúp hoàn thiện giao diện dashboard và trang chi tiết thiết bị với bố cục nhất quán mà không cần quản lý lượng lớn file CSS tùy chỉnh thủ công. **Axios** đảm nhiệm gọi HTTP có cấu hình header ủy quyền; **Recharts** phục vụ biểu đồ telemetry theo thời gian và theo metric—đáp ứng trực tiếp yêu cầu “giám sát trực quan” của đề tài.

### 5.1.3 Tích hợp và công cụ hỗ trợ

**Telegram Bot API** được dùng làm kênh **cảnh báo thời gian thực** bên ngoài ứng dụng web: backend gửi tin qua HTTPS, phù hợp kịch bản vận hành cá nhân hoặc nhóm nhỏ mà không cần triển khai hàng đợi tin nhắn phức tạp ngay từ đầu.

**Visual Studio Code** (hoặc IDE tương đương) phục vụ soạn thảo mã Python/JavaScript, tích hợp terminal và gỡ lỗi; đây là lựa chọn phổ biến trong đồ án và không ràng buộc độc quyền nền tảng.

**Postman** (hoặc ứng dụng tương tự như Insomnia, Thunder Client) dùng để **gửi thử nghiệm độc lập** các endpoint REST: đăng nhập, lấy JWT, gọi `GET/POST` với header và body chuẩn, giúp tách kiểm tra API khỏi lỗi giao diện phía trình duyệt.

**Git** và **GitHub** (hoặc dịch vụ Git tương đương) phục vụ **quản lý phiên bản mã nguồn**, sao lưu tiến độ và hợp tác; đây là thực hành chuẩn trong phát triển phần mềm và phù hợp báo cáo đồ án có kèm liên kết kho mã.

Tổng thể, bộ công nghệ trên tạo thành chuỗi công cụ **mã nguồn mở hoặc miễn phí** cho tầng phát triển, giảm rào cản triển khai và phù hợp phạm vi đồ án, đồng thời vẫn đủ mạnh để mô phỏng luồng IoT end-to-end.

## 5.2 Môi trường cài đặt

### 5.2.1 Phần cứng

Môi trường thử nghiệm điển hình cho đồ án là **máy tính cá nhân** (PC hoặc laptop) đáp ứng tối thiểu: bộ xử lý đa nhân (ví dụ **CPU** 4 luồng trở lên), **RAM** từ 8 GB trở lên để đồng thời chạy PostgreSQL, tiến trình Uvicorn, dev server Vite và trình duyệt; **ổ cứng** SSD giúp rút ngắn thời gian cài đặt dependency và khởi động cơ sở dữ liệu. Cấu hình cụ thể có thể ghi trong báo cáo in theo máy thực tế nhóm thực hiện (tên CPU, dung lượng RAM, hệ điều hành).

### 5.2.2 Phần mềm và phiên bản

Theo tài liệu dự án, môi trường khuyến nghị gồm: **Python 3.10+** cho backend và script giả lập thiết bị; **Node.js 18+** (bản LTS) cho frontend; **PostgreSQL** chạy cục bộ hoặc trên máy chủ mạng nội bộ. Các gói Python được khai trong `backend/requirements.txt`; frontend khai báo dependency trong `frontend/package.json` (React 19, Vite, Tailwind 4, v.v.). Việc dùng **môi trường ảo Python** (`venv`) giúp cô lập thư viện và tránh xung đột với hệ thống.

### 5.2.3 Cấu hình biến môi trường và kết nối

File **`.env`** đặt trong thư mục `backend/` (cùng cơ chế nạp của `pydantic-settings` và `python-dotenv`) thường chứa tối thiểu:

- **`DATABASE_URL`**: chuỗi kết nối PostgreSQL dạng `postgresql://user:password@host:port/database`, dùng bởi SQLAlchemy engine để backend thao tác dữ liệu.
- **`TELEGRAM_BOT_TOKEN`**: mã token bot từ BotFather, dùng khi gọi `https://api.telegram.org/bot.../sendMessage`.
- **`TELEGRAM_CHAT_ID`**: định danh kênh chat nhận cảnh báo.

Trong phiên bản mã nguồn hiện tại, **khóa ký JWT** được khai báo trong module `app/utils/auth` (hằng `SECRET_KEY`) chứ không đọc từ `.env`; khi báo cáo triển khai thực tế, nên chuyển secret này sang biến môi trường để đồng bộ với thực hành bảo mật đã nêu ở Chương 4.

**Kết nối frontend–backend:** trình duyệt chạy ứng dụng Vite tại địa chỉ mặc định **`http://localhost:5173`**, gọi API tới **`http://localhost:8000`**. Backend bật **CORSMiddleware** cho phép nguồn `http://localhost:5173` và `http://127.0.0.1:5173`, cho phép gửi cookie/ủy quyền theo cấu hình đã đặt trong `main.py`. Như vậy luồng dữ liệu giao diện là HTTP giữa hai cổng cục bộ trong giai đoạn phát triển.

**Kết nối backend–cơ sở dữ liệu:** backend sử dụng `DATABASE_URL` để tạo engine SQLAlchemy; mọi thao tác `Session` trong service đều đi qua kết nối này. PostgreSQL cần được khởi tạo sẵn (tạo database, user) trước khi chạy ứng dụng; schema bảng có thể được tạo khi khởi động ứng dụng thông qua `Base.metadata.create_all` như trong mã nguồn.

## 5.3 Thử nghiệm hệ thống

### 5.3.1 Chuẩn bị và khởi chạy

Quy trình thử nghiệm tuân theo README: clone kho mã, tạo virtualenv backend, `pip install -r requirements.txt`, cấu hình `.env`, chạy `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`; mở terminal riêng cho frontend, `npm install` và `npm run dev`. Sau khi hai tiến trình chạy ổn định, người thử nghiệm truy cập giao diện web và có thể mở tài liệu API tự sinh của FastAPI (nếu bật) để đối chiếu endpoint. Tùy chọn, chạy script trong `fake_devices/` để đẩy telemetry mô phỏng.

### 5.3.2 Thử nghiệm chức năng xác thực và phân quyền

**Đăng ký và đăng nhập:** tạo tài khoản mới qua giao diện hoặc qua `POST /auth/register`, sau đó đăng nhập qua `POST /auth/login`. Kết quả mong đợi là nhận **access token** dạng JWT; frontend lưu token và gửi kèm các request được bảo vệ. Thử nghiệm sai mật khẩu hoặc token hết hạn/sai định dạng phải trả lỗi 401, phù hợp cơ chế `get_current_user`.

**Phân quyền Owner và Viewer:** dùng hai tài khoản—một là chủ sở hữu thiết bị, một được thêm làm viewer. Owner thực hiện thao tác chỉ dành cho chủ (ví dụ xóa thiết bị, thêm thuộc tính, thêm/gỡ viewer, tạo hoặc cập nhật luật cảnh báo); viewer chỉ truy cập được các endpoint đọc và xem dữ liệu giám sát. Quan sát phản hồi **403 Forbidden** khi viewer cố gắng thao tác vượt quyền xác nhận dependency `device_permission` hoạt động đúng.

### 5.3.3 Thử nghiệm quản lý thiết bị và telemetry

**Tạo thiết bị:** gọi `POST /devices/` với JWT; hệ thống sinh `device_token`. Kiểm tra danh sách thiết bị trên `GET /devices/` và trên giao diện **danh sách thiết bị**. **Cập nhật** trong phạm vi hiện tại tập trung vào **luật cảnh báo** (`PATCH /alert-rules/rules/{id}`) và các thực thể phụ (attributes, viewers); thông tin thiết bị có thể được bổ sung theo roadmap dự án—báo cáo chỉ mô tả đúng chức năng đã có trong mã.

**Gửi telemetry:** từ script giả lập hoặc Postman, gửi `POST /telemetry/` với header `x-device-token` trùng thiết bị. Quan sát phản hồi 200 và bản ghi mới trong cơ sở dữ liệu; nếu token sai, nhận 403. Trên **Device Overview**, làm mới trang và kiểm tra biểu đồ, bảng và thống kê metric.

**[Hình 5.1 – Ảnh chụp màn hình Dashboard sau khi có dữ liệu.]**

**[Hình 5.2 – Ảnh chụp màn hình danh sách / thẻ thiết bị.]**

**[Hình 5.3 – Ảnh chụp màn hình trang Device Overview: biểu đồ Recharts và bảng telemetry.]**

### 5.3.4 Thử nghiệm cảnh báo và Telegram

Cấu hình đúng `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID`. Tạo **AlertRule** với metric trùng khóa trong payload telemetry, điều kiện và ngưỡng dễ vượt qua khi gửi dữ liệu giả lập. Sau mỗi lần ghi telemetry, hệ thống gọi `check_alerts`; khi điều kiện thỏa và logic gửi tin cho phép, tin nhắn xuất hiện trên Telegram; đồng thời có thể đối chiếu bảng **alert_history** hoặc trang **lịch sử cảnh báo** trên web. Thử nghiệm **chống spam**: gửi telemetry liên tục khi đã cảnh báo—quan sát chỉ nhận nhắc lại sau **cooldown**; thử tắt mạng hoặc token Telegram sai để xác nhận không ghi lịch sử khi gửi thất bại (đúng thiết kế trong `alert_service`).

**[Hình 5.4 – Ảnh chụp màn hình trang Alerts hoặc panel luật cảnh báo trên thiết bị.]**

**[Hình 5.5 – Ảnh chụp màn hình ứng dụng Telegram nhận tin cảnh báo từ bot.]**

### 5.3.5 Kiểm thử API bằng Postman

Xây dựng **collection** gồm các bước: (1) login, lưu biến môi trường `access_token`; (2) gọi `GET /devices/` với header `Authorization: Bearer {{access_token}}`; (3) `POST /telemetry/` với biến `x-device-token`; (4) `GET /devices/{id}/telemetry` và `/telemetry/stats?metric=...`. Việc tách kiểm thử API giúp xác nhận **hợp đồng REST** độc lập với giao diện, phù hợp báo cáo thử nghiệm có minh chứng request/response.

### 5.3.6 Nhận xét kết quả

Trong điều kiện môi trường phát triển cục bộ đã cấu hình đúng, hệ thống **hoạt động ổn định** cho các luồng: đăng nhập, duyệt dashboard, xem telemetry và thống kê, cấu hình viewer và luật cảnh báo, nhận tin Telegram khi cấu hình hợp lệ. **Dữ liệu** được lưu vào PostgreSQL **nhất quán** với thao tác trên giao diện và với kết quả truy vấn Postman. **Bảo mật và phân quyền** thể hiện qua việc JWT bảo vệ API người dùng, token thiết bị bảo vệ kênh telemetry, và phân biệt owner/viewer theo thiết kế đã trình bày ở Chương 4. Hạn chế còn lại chủ yếu thuộc phạm vi **triển khai thực tế** (HTTPS, secret JWT trong biến môi trường, sao lưu DB), không làm mất tính hợp lệ của kết quả thử nghiệm chức năng trong phạm vi đồ án.

---

**Kết luận chương:** Chương 5 đã mô tả **công cụ và môi trường** phục vụ cài đặt **IoT Device Platform**, cách **kết nối** giữa frontend, backend và PostgreSQL, cùng **kịch bản thử nghiệm** và **vị trí hình minh họa** (Hình 5.1–5.5) để hoàn thiện báo cáo in. Kết quả cho thấy hệ thống đáp ứng mục tiêu giám sát thiết bị, tích hợp cảnh báo Telegram và phân quyền truy cập theo thiết bị trong môi trường thử nghiệm đã mô tả.

