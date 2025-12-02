-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM menu_items;
-- DELETE FROM menus;
-- DELETE FROM items;

-- 아이템 데이터
INSERT IGNORE INTO items (name, price, stock_quantity) VALUES 
('스테이크', 45000, 0),
('와인(병)', 60000, 0),
('샴페인', 90000, 0),
('와인(잔)', 12000, 0),
('커피', 6000, 0),
('샐러드', 18000, 0),
('에그 스크램블', 15000, 0),
('베이컨', 7000, 0),
('빵', 4000, 0),
('바게트빵', 5000, 0),
('커피 포트', 10000, 0);

-- 메뉴 데이터
INSERT IGNORE INTO menus (type, base_price) VALUES 
('VALENTINE', 100000),
('FRENCH', 80000),
('ENGLISH', 70000),
('CHAMPAGNE_FESTIVAL', 250000);

-- 메뉴-아이템 관계 설정
-- 발렌타인 디너: 와인(병) 1병, 스테이크 1개
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'VALENTINE' AND i.name IN ('와인(병)', '스테이크');

-- 프렌치 디너: 커피 1잔, 와인(잔) 1잔, 샐러드 1개, 스테이크 1개
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'FRENCH' AND i.name IN ('커피', '와인(잔)', '샐러드', '스테이크');

-- 잉글리시 디너: 에그 스크램블 1개, 베이컨 1개, 빵 1개, 스테이크 1개
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'ENGLISH' AND i.name IN ('에그 스크램블', '베이컨', '빵', '스테이크');

-- 샴페인 축제 디너: 샴페인 1병, 바게트빵 4개, 커피 포트 1개, 와인(병) 1병, 스테이크 2개
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'CHAMPAGNE_FESTIVAL' AND i.name IN ('샴페인', '바게트빵', '커피 포트', '와인(병)', '스테이크');

