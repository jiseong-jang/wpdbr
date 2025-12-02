-- 초기 아이템 데이터 (중복 방지)
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

-- 초기 메뉴 데이터 (중복 방지)
INSERT IGNORE INTO menus (type, base_price) VALUES 
('VALENTINE', 100000),
('FRENCH', 80000),
('ENGLISH', 70000),
('CHAMPAGNE_FESTIVAL', 250000);

-- 메뉴-아이템 관계 (발렌타인 디너: 와인 1병, 스테이크 1개)
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'VALENTINE' AND i.name IN ('와인(병)', '스테이크');

-- 메뉴-아이템 관계 (프렌치 디너: 커피 1잔, 와인 1잔, 샐러드 1개, 스테이크 1개)
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'FRENCH' AND i.name IN ('커피', '와인(잔)', '샐러드', '스테이크');

-- 메뉴-아이템 관계 (잉글리시 디너: 에그 스크램블 1개, 베이컨 1개, 빵 1개, 스테이크 1개)
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'ENGLISH' AND i.name IN ('에그 스크램블', '베이컨', '빵', '스테이크');

-- 메뉴-아이템 관계 (샴페인 축제 디너: 샴페인 1병, 바게트빵 4개, 커피 포트 1개, 와인 1병, 스테이크 2개)
INSERT IGNORE INTO menu_items (menu_id, item_id) 
SELECT m.id, i.id FROM menus m, items i 
WHERE m.type = 'CHAMPAGNE_FESTIVAL' AND i.name IN ('샴페인', '바게트빵', '커피 포트', '와인(병)', '스테이크');

-- 주방 직원 5명 (비밀번호는 모두 'password'로 암호화됨)
INSERT IGNORE INTO users (id, password, role, is_logged_in) VALUES 
('kitchen1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KITCHEN_STAFF', false),
('kitchen2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KITCHEN_STAFF', false),
('kitchen3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KITCHEN_STAFF', false),
('kitchen4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KITCHEN_STAFF', false),
('kitchen5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KITCHEN_STAFF', false);

INSERT IGNORE INTO staff (user_id, employee_id, is_busy) VALUES 
('kitchen1', 'K001', false),
('kitchen2', 'K002', false),
('kitchen3', 'K003', false),
('kitchen4', 'K004', false),
('kitchen5', 'K005', false);

INSERT IGNORE INTO kitchen_staff (staff_id) VALUES 
((SELECT user_id FROM staff WHERE employee_id = 'K001')),
((SELECT user_id FROM staff WHERE employee_id = 'K002')),
((SELECT user_id FROM staff WHERE employee_id = 'K003')),
((SELECT user_id FROM staff WHERE employee_id = 'K004')),
((SELECT user_id FROM staff WHERE employee_id = 'K005'));

-- 배달 직원 5명
INSERT IGNORE INTO users (id, password, role, is_logged_in) VALUES 
('delivery1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_STAFF', false),
('delivery2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_STAFF', false),
('delivery3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_STAFF', false),
('delivery4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_STAFF', false),
('delivery5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_STAFF', false);

INSERT IGNORE INTO staff (user_id, employee_id, is_busy) VALUES 
('delivery1', 'D001', false),
('delivery2', 'D002', false),
('delivery3', 'D003', false),
('delivery4', 'D004', false),
('delivery5', 'D005', false);

INSERT IGNORE INTO delivery_staff (staff_id) VALUES 
((SELECT user_id FROM staff WHERE employee_id = 'D001')),
((SELECT user_id FROM staff WHERE employee_id = 'D002')),
((SELECT user_id FROM staff WHERE employee_id = 'D003')),
((SELECT user_id FROM staff WHERE employee_id = 'D004')),
((SELECT user_id FROM staff WHERE employee_id = 'D005'));

-- 샘플 쿠폰
INSERT IGNORE INTO coupons (code, discount_amount, is_valid) VALUES 
('WELCOME10000', 10000, true),
('SAVE5000', 5000, true),
('SPECIAL20000', 20000, true);

