 
recipe('Salad Rau Tron', ['rau', 'dua leo', 'ca chua']).
recipe('Trung Chien', ['trung', 'hanh']).
recipe('Ga Ran', ['thit ga', 'bot']).
recipe('Pho Bo', ['thit bo', 'banh pho', 'rau thom', 'hanh', 'que']).
recipe('Bun Cha', ['thit heo', 'bun', 'rau song', 'nuoc mam', 'toi', 'ot']).
recipe('Com Chien Hai San', ['com', 'tom', 'muc', 'trung', 'hanh']).
recipe('Mi Xao Hai San', ['mi', 'tom', 'muc', 'rau cai', 'hanh', 'toi']).
recipe('Lau Thai', ['tom', 'muc', 'thit bo', 'nam', 'rau thom', 'sa', 'la chanh']).
 
recipe('Lau Hai San', ['tom', 'muc', 'ca', 'nam', 'rau muong', 'bap cai', 'hanh', 'toi']).
recipe('Banh Mi Xiu Mai', ['banh mi', 'thit heo', 'ca chua', 'hanh', 'nam']).
recipe('Ga Nuong Mat Ong', ['thit ga', 'mat ong', 'nuoc tuong', 'toi', 'gung']).
recipe('Com Ga Hoi An', ['com', 'thit ga', 'rau ram', 'hanh', 'gung', 'sa']).
recipe('Bo Kho', ['thit bo', 'ca rot', 'khoai tay', 'hanh', 'toi', 'sa', 'que']).
recipe('Canh Chua Ca', ['ca', 'dau bap', 'bac ha', 'me', 'rau thom', 'gung']).
recipe('Banh Xeo', ['bot gao', 'thit heo', 'tom', 'gia', 'rau song']).
recipe('Goi Cuon', ['banh trang', 'thit heo', 'tom', 'bun', 'rau song', 'rau thom']).
recipe('Bun Bo Hue', ['thit bo', 'bun', 'hanh', 'sa', 'rau muong', 'gia']).
recipe('Thit Kho Tau', ['thit heo', 'trung', 'nuoc dua', 'hanh', 'toi']).

% Định nghĩa các nguyên liệu thay thế
replacement('thit ga', 'thit bo').
replacement('thit ga', 'thit heo').
replacement('thit heo', 'thit bo').
replacement('thit heo', 'thit ga').
replacement('thit bo', 'thit heo').
replacement('thit bo', 'thit ga').
replacement('nuoc mam', 'tuong').
replacement('nuoc tuong', 'nuoc mam').
replacement('mi', 'bun').
replacement('bun', 'mi').
replacement('ca', 'tom').
replacement('tom', 'muc').
replacement('muc', 'ca').
replacement('rau muong', 'rau cai').
replacement('bap cai', 'rau muong').
replacement('dua leo', 'ca chua').
replacement('bot gao', 'bot mi').

% Định nghĩa các gia vị thay thế (không thay đổi hương vị nhiều)
spice_replacement('toi', 'hanh').
spice_replacement('hanh', 'hanh la').
spice_replacement('ot', 'tieu').
spice_replacement('sa', 'hung').
spice_replacement('hung', 'rau mui').
spice_replacement('gung', 'nghe').
spice_replacement('que', 'hoi').
spice_replacement('rau thom', 'rau hung').
spice_replacement('rau ram', 'rau hung').

% Kiểm tra xem nguyên liệu có sẵn hay không (trực tiếp hoặc qua thay thế)
ingredient_available(Ingredient, Ingredients) :- 
    member(Ingredient, Ingredients).
ingredient_available(Ingredient, Ingredients) :- 
    replacement(Ingredient, Alternative), 
    member(Alternative, Ingredients).
ingredient_available(Ingredient, Ingredients) :- 
    spice_replacement(Ingredient, Alternative), 
    member(Alternative, Ingredients).

% Kiểm tra tất cả nguyên liệu cần thiết
all_ingredients_available([], _).
all_ingredients_available([H|T], Ingredients) :- 
    ingredient_available(H, Ingredients), 
    all_ingredients_available(T, Ingredients).
 
suggest_recipe(Ingredients, Recipe) :- 
    recipe(Recipe, Required), 
    all_ingredients_available(Required, Ingredients).
 
list_ingredients(Recipe, OriginalIngredients, SubstitutedIngredients) :-
    recipe(Recipe, RequiredIngredients),
    find_substitutions(RequiredIngredients, OriginalIngredients, SubstitutedIngredients).

% Tìm nguyên liệu thay thế thực tế được sử dụng
find_substitutions([], _, []).
find_substitutions([Ingredient|Rest], AvailableIngredients, [Ingredient|SubstitutedRest]) :-
    member(Ingredient, AvailableIngredients),
    find_substitutions(Rest, AvailableIngredients, SubstitutedRest).
find_substitutions([Ingredient|Rest], AvailableIngredients, [Substitute|SubstitutedRest]) :-
    \+ member(Ingredient, AvailableIngredients),
    (replacement(Ingredient, Substitute) ; spice_replacement(Ingredient, Substitute)),
    member(Substitute, AvailableIngredients),
    find_substitutions(Rest, AvailableIngredients, SubstitutedRest).
    
show_recipe_with_substitutions(Recipe, AvailableIngredients) :-
    recipe(Recipe, RequiredIngredients),
    format('Món ăn: ~w~n', [Recipe]),
    format('Nguyên liệu gốc: ~w~n', [RequiredIngredients]),
    find_all_substitutions(RequiredIngredients, AvailableIngredients, Substitutions),
    format('Nguyên liệu thay thế: ~w~n', [Substitutions]).

% Tìm tất cả các nguyên liệu thay thế
find_all_substitutions([], _, []).
find_all_substitutions([Ingredient|Rest], AvailableIngredients, [Ingredient|SubstitutedRest]) :-
    member(Ingredient, AvailableIngredients),
    find_all_substitutions(Rest, AvailableIngredients, SubstitutedRest).
find_all_substitutions([Ingredient|Rest], AvailableIngredients, [Sub|SubstitutedRest]) :-
    \+ member(Ingredient, AvailableIngredients),
    (replacement(Ingredient, Sub) ; spice_replacement(Ingredient, Sub)),
    member(Sub, AvailableIngredients),
    find_all_substitutions(Rest, AvailableIngredients, SubstitutedRest).
 
suggest_recipe_by_match_percentage(Ingredients, Recipe, Percentage) :-
    recipe(Recipe, Required),
    count_available_ingredients(Required, Ingredients, Available, Total),
    Percentage is (Available / Total) * 100,
    Percentage >= 70.   

% Đếm số nguyên liệu sẵn có
count_available_ingredients([], _, 0, 0).
count_available_ingredients([H|T], Ingredients, Available, Total) :-
    count_available_ingredients(T, Ingredients, RestAvailable, RestTotal),
    Total is RestTotal + 1,
    (ingredient_available(H, Ingredients) -> Available is RestAvailable + 1 ; Available is RestAvailable).