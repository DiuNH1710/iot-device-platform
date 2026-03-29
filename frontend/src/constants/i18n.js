/**
 * Nhãn giao diện tiếng Việt (tập trung, tái sử dụng).
 * Không đổi tên export `vi` để import nhất quán.
 */
export const vi = {
  common: {
    loading: "Đang tải…",
    saving: "Đang lưu…",
    deleting: "Đang xóa…",
    signingIn: "Đang đăng nhập…",
    creating: "Đang tạo…",
    save: "Lưu",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Sửa",
    close: "Đóng",
    refresh: "Làm mới",
    back: "Quay lại",
    open: "Mở",
    actions: "Thao tác",
    name: "Tên",
    value: "Giá trị",
    message: "Nội dung",
    user: "Người dùng",
    imei: "IMEI",
    description: "Mô tả",
    optional: "tùy chọn",
    yes: "Có",
    no: "Không",
    enabled: "Đang bật",
    disabled: "Đang tắt",
    chart: "Biểu đồ",
    table: "Bảng",
    view: "Chế độ xem",
    average: "Trung bình",
    max: "Cao nhất",
    min: "Thấp nhất",
    metric: "Chỉ số",
    threshold: "Ngưỡng",
    condition: "Điều kiện",
    severity: "Mức độ",
    sentTo: "Gửi tới",
    sentAt: "Thời điểm gửi",
    timeUtc: "Thời gian (UTC)",
    unnamedDevice: "Thiết bị chưa đặt tên",
    dash: "—",
  },

  nav: {
    brand: "Bảng điều khiển IoT",
    dashboard: "Tổng quan",
    devices: "Thiết bị",
    alerts: "Cảnh báo",
    logout: "Đăng xuất",
  },

  authLayout: {
    title: "Nền tảng thiết bị IoT",
    subtitle: "Bảng điều khiển quản lý thiết bị",
  },

  login: {
    title: "Đăng nhập",
    username: "Tên đăng nhập",
    password: "Mật khẩu",
    submit: "Đăng nhập",
    noAccount: "Chưa có tài khoản?",
    registerLink: "Đăng ký",
    errorFallback: "Đăng nhập thất bại",
  },

  register: {
    title: "Tạo tài khoản",
    email: "Email",
    submit: "Đăng ký",
    hasAccount: "Đã có tài khoản?",
    signInLink: "Đăng nhập",
    errorFallback: "Đăng ký thất bại",
  },

  dashboard: {
    title: "Tổng quan",
    subtitle: "Tổng quan thiết bị kết nối và hoạt động gần đây.",
    statDevices: "Thiết bị",
    statAlertRows: "Bản ghi cảnh báo",
    sectionDevices: "Thiết bị của bạn",
    manageDevices: "Quản lý thiết bị →",
    empty: "Chưa có thiết bị nào.",
    addDevice: "Thêm thiết bị",
    loadError:
      "Không tải được danh sách thiết bị. Kiểm tra API và phiên đăng nhập.",
    loadingDevices: "Đang tải thiết bị…",
  },

  dashboardCard: {
    noTelemetry: "Chưa có dữ liệu telemetri.",
    latestTelemetry: "Dữ liệu thiết bị mới nhất",
    recentAlerts: "Cảnh báo gần đây:",
    historyLink: "Lịch sử →",
    youOwn: "Bạn là chủ thiết bị này",
  },

  alertsPage: {
    title: "Cảnh báo",
    subtitle:
      "Quy tắc cảnh báo được cấu hình theo từng thiết bị. Chọn thiết bị để xem hoặc tạo quy tắc (chỉ chủ thiết bị).",
    loadError: "Không tải được thiết bị.",
    empty: "Chưa có thiết bị nào.",
    addDevice: "Thêm thiết bị",
    history: "Lịch sử",
    rules: "Quy tắc",
  },

  deviceList: {
    title: "Thiết bị",
    subtitle: "Đăng ký và quản lý thiết bị IoT của bạn.",
    addDevice: "Thêm thiết bị",
    loading: "Đang tải…",
    empty: "Chưa có thiết bị. Tạo thiết bị để bắt đầu.",
    modalTitle: "Thêm thiết bị",
    imei: "IMEI",
    imeiPlaceholder: "IMEI duy nhất của thiết bị",
    name: "Tên thiết bị",
    descriptionOptional: "Mô tả (tùy chọn)",
    create: "Tạo",
  },

  deviceLayout: {
    loading: "Đang tải thiết bị…",
    errorFallback: "Không tải được thiết bị",
    notFound: "Không tìm thấy thiết bị.",
    backToDevices: "← Quay lại danh sách thiết bị",
    backLink: "← Thiết bị",
  },

  deviceSubNav: {
    overview: "Tổng quan",
    attributes: "Thuộc tính",
    alertHistory: "Lịch sử cảnh báo",
    viewers: "Người xem",
  },

  deviceCard: {
    viewerAccess: "Quyền xem",
    youOwn: "Bạn là chủ thiết bị này",
  },

  deviceOverview: {
    deleteConfirm: "Xóa thiết bị này? Hành động này không thể hoàn tác.",
    deleteDevice: "Xóa thiết bị",
    telemetry: "Telemetri",
    timeRange: "Khoảng thời gian",
    range1h: "1 giờ qua",
    range24h: "24 giờ qua",
    range7d: "7 ngày qua",
    rangeAll: "Tất cả (vẫn giới hạn số bản ghi)",
    metricsToPlot: "Chỉ số hiển thị trên biểu đồ",
    metricsHint: "Chọn một hoặc nhiều chỉ số. Một chỉ số dùng biểu đồ gọn hơn.",
    statistics: "Thống kê",
    metricForStats: "Chỉ số thống kê",
    selectMetric: "Chọn một chỉ số.",
    loadingStats: "Đang tải thống kê…",
    alertRules: "Quy tắc cảnh báo",
    errorFallback: "Yêu cầu thất bại",
  },

  deviceAttributes: {
    title: "Thuộc tính thiết bị",
    add: "Thêm thuộc tính",
    intro:
      "Siêu dữ liệu dạng khóa–giá trị. Tạo lại cùng tên sẽ cập nhật giá trị.",
    loading: "Đang tải…",
    empty: "Chưa có thuộc tính nào.",
    colName: "Tên",
    colValue: "Giá trị",
    readOnly: "Bạn chỉ có quyền xem.",
    modalAdd: "Thêm thuộc tính",
    modalEdit: "Sửa thuộc tính",
    deleteConfirm: (name) => `Xóa thuộc tính "${name}"?`,
  },

  deviceViewers: {
    title: "Chia sẻ quyền xem",
    intro:
      "Người xem có thể đọc telemetri, thuộc tính và cảnh báo nhưng không đổi cấu hình thiết bị hay quy tắc.",
    loading: "Đang tải danh sách người xem…",
    empty: "Chưa có người xem nào.",
    userId: (id) => `mã #${id}`,
    removeConfirm: "Gỡ quyền xem của người này?",
    addLabel: "Thêm người xem",
    selectUser: "Chọn người dùng…",
    addButton: "Thêm người xem",
    ownerOnly: "Chỉ chủ thiết bị mới quản lý được người xem.",
    noCandidates:
      "Không còn người dùng phù hợp (đã là người xem hoặc chủ thiết bị).",
    remove: "Gỡ",
  },

  deviceAlertHistory: {
    title: "Lịch sử cảnh báo",
    intro: "Các cảnh báo đã kích hoạt gần đây (mới nhất trước).",
    loadError: "Không tải được lịch sử. Kiểm tra quyền truy cập thiết bị.",
    empty: "Chưa có lịch sử cảnh báo.",
    badgeInfo: "thông tin",
  },

  telemetry: {
    loadingChart: "Đang tải biểu đồ…",
    noRows: "Chưa có bản ghi telemetri.",
    selectMetric: "Chọn chỉ số để vẽ biểu đồ.",
    noNumericForMetric: (key) =>
      `Không có giá trị số cho “${key}” trong khoảng này.`,
    selectOneWithData: "Chọn ít nhất một chỉ số có dữ liệu.",
    noNumericMulti:
      "Không có giá trị số cho các chỉ số đã chọn trong khoảng này.",
    noRowsTable: "Không có dòng để hiển thị.",
    noMetricsYet: "Chưa có chỉ số trong telemetri.",
    metricLabel: "Chỉ số",
  },

  alertRules: {
    loading: "Đang tải quy tắc…",
    empty: "Chưa có quy tắc cảnh báo cho thiết bị này.",
    createRule: "Tạo quy tắc",
    viewerNote: "Người xem chỉ xem được quy tắc, không chỉnh sửa.",
    modalEdit: "Sửa quy tắc cảnh báo",
    disable: "Tắt",
    enable: "Bật",
    condGreater: "> (lớn hơn)",
    condLess: "< (nhỏ hơn)",
    condGte: ">= (lớn hơn hoặc bằng)",
    condLte: "<= (nhỏ hơn hoặc bằng)",
    condEq: "= (bằng)",
    createRuleBtn: "Tạo quy tắc",
  },

  alertForm: {
    metric: "Chỉ số",
    condition: "Điều kiện",
    threshold: "Ngưỡng",
    message: "Nội dung",
    noMetrics: "Chưa có chỉ số",
    defaultMessage: "Vượt ngưỡng",
    fallbackMessage: "Cảnh báo",
  },

  errors: {
    requestFailed: "Yêu cầu thất bại",
    loginFailed: "Đăng nhập thất bại",
    registerFailed: "Đăng ký thất bại",
  },
};
