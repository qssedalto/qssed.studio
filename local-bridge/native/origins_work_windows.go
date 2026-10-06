// 【初学者导读】
// 文件：local-bridge/native/origins_work_windows.go
// Windows 本地桥接原生模块：提供本机进程/升级/允许来源等能力。
// 阅读顺序：先确认本文件导出的数据/函数被谁使用，再看数据键、转换规则和失败/回退逻辑；数据型文件也要理解“谁消费它”。
// 修改注意：这是网页到本机的安全边界，必须严格限制允许来源、命令和升级来源。
// 调试方法：优先验证输入 key/ID/locale/host 是否正确，再检查转换后的结构，不要一开始就改最终展示。
package main

// Windows Work 允许来源初始化：把正式 AERTEX Work 域名加入本地桥接白名单。新增来源应逐个明确列出，不使用宽泛通配符。
func init() {
	allowedOrigins["https://work.qsseda.com"] = true
	allowedOrigins["https://work.qsseda.online"] = true
	allowedOrigins["https://work.qsseda.studio"] = true
}
