GDPC                                                                             
   <   res://.import/icon.png-487276ed1e3a0c39cad0279d744ee560.stexP      �	      ?K�7g=~�x�Ny��D   res://.import/white-circle.png-fd9ec96f5f813bd0d459d50130c980de.stex�!      X      m8	�M2z�E�����   res://Circle.tscn   �            �6a���Z!�x��2�   res://CircleArea.vs             1�z �xJi5��-��   res://Main.tscn 0
      !      �A��W;�є�   res://Main.vs   `      �	      b�m��3���C�M��   res://icon.png  �+      �	      s{No��.�Do���Z   res://icon.png.import          �      ��fe��6�B��^ U�   res://project.binary�5      m      nF�
�����]~���    res://white-circle.png.import   0)      �      �
�!����>,�=tY            [gd_scene load_steps=5 format=2]

[ext_resource path="res://white-circle.png" type="Texture" id=1]
[ext_resource path="res://CircleArea.vs" type="Script" id=2]

[sub_resource type="CanvasItemMaterial" id=1]
blend_mode = 1

[sub_resource type="CircleShape2D" id=2]
radius = 128.0

[node name="Sprite" type="Sprite"]
material = SubResource( 1 )
texture = ExtResource( 1 )

[node name="Area2D" type="Area2D" parent="."]
script = ExtResource( 2 )

[node name="CollisionShape2D" type="CollisionShape2D" parent="Area2D"]
shape = SubResource( 2 )
    RSCC      #  �  ,   (�/�` e& �n�Cs�(  � (%�J� �@V<V�8�m��d�W�F�d�K��ϖ�����]�-	8��0c#b#6vck��w � � �t�֍I�A�mǱ}&��l�-]p��Z�+��P��$�2��o
��SB!�7��>�����\�Z}�On��gr}�]��F���Υ7MΓ�u��|�Jǰ^j���_�{���wm,�$�?�rTb��
���a���\�  ^1$x)��\!ˊ�mƛ	Yt�=��D6]�v�hB��&�6�ܸ55x\3��5b�U�ru�h����C�Yp
"<>a���<���!� ��e,$����e��8������_�3M�;�2,���0`��� T0��?��V��X-mF0Jxi3��q��,�0ב��7�RQ1���S�S>��1g��gtZ6��Q��|mg�XR��bR[l�%����*�u�k�^m���E��O�Yos�"�j/�$��l�����g�����9y��6����C��|���0���X��g����f�W��dp�+�_DS�����ÿ@G�_G����Щh���`�_JZ�}yyyq�@��U�M-Z�&^��$=�� pm��@�aU24##)HA!�a�(� �����!� �!� RTNJ
R�T���eeaw�L��p���ɴCt^��H�����N2;��
�5�#��"��,���Z �3j��U2U _i�Ƿ��S$\:�iƷ�/�$�������ה6�5T|J��&��y���Uta ��߁>`T��*2�ff��8-�{��aX����y�C�œ���Z��
qd��wB(wM8*���֐��ۑ���i+D���zw��f4I8Tw�P ;C����~9�����Y��#H4&��`����aQ,���ƹ)�U�e��>�p婪��IP\0C ����%�F�T�5�&�dȜ\�i��5�<�(fV��HZ�]R'h <�s���VB��#�/���K�E{V=�� 2	Ҿ��	C����ڐ�W�U�c$��2pj��An['���w+�"4��纆Zg���|�Z����}�$?��]ŋ
�taK�|_�S!�� �r���Z� �m�Qx_��~E����1������	�X �O���58�f�6�, �1����}�X0�t���ϧ'iEOV�"1��P���.�^R�ӹ3��5Ψ��ƥ}�c�<�R��iJ���(�/� #          	   vs_unify       RSRCRSCC  [gd_scene load_steps=2 format=2]

[ext_resource path="res://Main.vs" type="Script" id=1]

[node name="Main" type="Node2D"]
script = ExtResource( 1 )

[node name="Timer" type="Timer" parent="."]
autostart = true

[connection signal="timeout" from="Timer" to="." method="_on_Timer_timeout"]
               RSCC      �'  �    )  (�/�` �# V�D�& <� � HT ) �"�F��!{3ʾ���t`�\8��@�jfS�7P�u��=?��ijm
h v | א2�����O���i��������:	�'y���?�[n󹖜m,��;^y��r�i��ۮs�E��Jgɯ��.���۬L������Ow�P� ���?O!q?�Ȏ����M^�`q���WRE�O�Q��H$�_t�j�8>
S$� �5oa~η{�*磳�=XwF�N�`�kØ�7MY�Tk��=��q[,�\��On+���M;�;�b��#[7����k	i<��X�.�P�_W����B���&u�-�w�Ž��v��γ��&g���89�������+A����P�D`�K!79�p|��U:<E$�'!�R�H���K���<Z|e�U:��A4���\�+(�+���
�����eD2`�(��#�x.@.%!'�4�� I=8�e�%`lʫ���j^�����_����ՐVѕy���q���\3�C�v��̇��c��[3�`em\a<�Y����ajd$I
��5��(堃|�)E��R�C�d�H �$%%I�t<�&J�@�G(�H�4��ݡ��f�7-��#��lc	d����]W7�^
6Ý��ٳx�pַ8S;�ZH����拰���<�F �-@Fcs��@�j�Ե7�����Qk�,�" {7�s�M(Z�r�h2A{�bI����������2s��kÈk �{�9��8UW�����B�B 2Gg@��`LIC"��S��*�,J�m�����.��/��U����n���i�#xs)3���ж�K��;4�X��H|:8�r��o�͚Ůꎂ5��^!0�=�)k2.;�?���-Im($vb6 |��Ъ V��T�.���I���t(D�
o�:�0�^K4�'<	JQ�琌����\͛%2v�\A����fJ�����k�d6�*5X%���Y�gK� ���k�,gY�V�)�ͧ�d����ꍦTg�d��Rz���$�E5y���FJi��!����\̃��CG�
��ʼ��1�F;+�y1do�� �&^�v�3�̚��1}.֍��pc���-��Q��s�K���ǲ���
��ǚ�h���(�/�` m �S5@m���8��(�b���H��AZB�nK#nw��˦�3�m2���G��FR? E J �4ZF��I�0Fn���x���tia���@g��I�#TJ����S�e/����������:=�q[�-�l��RV�#·�^���s���a ���#=����v*I��ߠ��`��m��z��&���rX��*/�Ii�^�d�$0p�ֲc�h̰.*m���5�
��|$���
�8&�_aqo{�Z5.��<8��Icxk�|(��T�V��VP�)���j��rn(�Ya0�8��uK��t�-�娥�-��5M����E�$%��pp"�`�ʒ2�@D��H I$""��i�&��h�9��4�8�;�`�q�H)���Ǐ����B��?�S	�H ��w��j��Qݙ_vsD����e0�f��jy�;(��Cqr��q���#��q;K��@�p�1��Atٷ��!۔b{օ%�b�rU�vn���d, DR9%=� �܏$�Aq��l�[�D���;�5�Vg�ѷ![Fp�bPTܾ�5.B)�a�����Ml�|%#F��Κ����,m�� Ҩ�M	��
���b�k���K[]��voe@��X�1.��^CT@x��}�|�9i4F���lr���������m�$��P!'U�̒����
� 8_@�k��2c�m~�m7 �PbE81@q$A���!�bh�[�@�NR���6�"�Y�{��'d-��(�/�`�� �
 �D  HC          E  4@!E  �0E	�	@
��D�E�'E  ��6�@&E  �T%D D 44Cc!\D'a(z)�1*r,�@-�2E  D . �D!/D"   sequence_connections		dataP .    	 ')*, ,()-,namef_312843592un_id����croll��C|��node is_tool_scriptvs_unify   RSRC������IR��@i���+�	1R��r���ś��v�����}D�ɚ�y��pa���JS����Ԗy�%l��Hdd���!}"��r@�AJ �d8?,�k����A>WD'�lgڰ��O�,�u7��
X�PQ�/H֣������V�#Ly�p�2�gp�o��r����ðp�ȪY�yL�[�.�PU>բ�����ݍ�!��V��Q�JV�A�eu�{���������RSCC           GDST@   @            �	  WEBPRIFF�	  WEBPVP8L�	  /?� �\`!����@�o9B ��@ 	c�Q���۶��m����Rե��˶m۶m۶m۶m۶���t)�r�TR�nʒm���6�\غ�m�"�m�5|�m۶mۼ�mm�9%j�I��EDf�ضm�|m[;cgck۶m۶�rMee��FR$��2���#�T �[��k��� }�=���� ����^}��q�ɴ0.(}]���| ��Gc�}8ns�������\(g\!d��L�a�>�� @���U$�P�o6�'�b�ʀ`� �!�Ϡ2��1��>�%��!7}1��1V�{a�r���	�P"��)F|V3�	8���� 0�b�(��$s$J�R���=u��7P��t@F�־j�g���#���n;���A1��EW���3�?���!50�fQ�mH.B���=u糍���4{7�)
Bk���Aѐ�Q�;����v-����:0%����{_<�����a�{^|�K?�$��آ�XB�;�v���v��>o�W�P��ED���ǿ���~�O�1��G�$&B�rh��eJ��ؿ��wN���&x�E.�& ��������6��E����W��O�m"#u������I��$��Au;W:����A����g�@��">b�� ���^Q1�~����z����]2��弣ߞw�{M�u�MWַ�� ��`L��T��Z>��Q��2��[�ʄ/"> ��%H�U.Җ���-3h�a��1��Fe[2!u�9�#s}洟���US��RM)��mU}d���r�����0�|
ɿ��yd�~g�}����c���[/o;�W�hj�#��k"��~���F̳f�K��g�5��4xQ<���w�gh�ŗ t�ŝU�5+#�奾���̃/JrXQ��]���<N��kVA=P\����n&PX�Ԯ,���Dj�g�8��$C���.��#D�p̾au�
�u�������"^3i@Ʃ����y�����3~0���!���n��M��;]w���������� `R��s�E�n�N��A���P�,��W��ݿL�c���$n�#� ����e�� '0��������1 c�6&�qt�)�C�ӕ���K�j�f�ĚG��L=�&�;ᷘw@FT �%M��C�5#3 $ێ

�Y)D 
p��s���}���0eI���p����/�A��D`^ �n�g� ��0^�v�)6�f������?���
 J3�4r8ȉP�@�Tg� ��/2���i��x��/���ү[�K�[ >(9`�r�J ��� f�],x�K7>{�5_=q�Oa�|����jkA  .���`*vq���1��s�?�-�+�w�Z� $Y+���8�!�[����]q��-���$V�_�_l����o�P"W˕����K{���Y�#���P�ןZ��p��GZ���\��e��O�R�<�/{ӓ�  ̠���',&�o���q����'֗ �]�>P  $��֣��/�������J�L��tcd�M���O?q?;�B���]���em�o�f5�����O���w�B�F����?8�����#I�L�K�C�L�CѲ��_�~B��X�m���D�&Cn�ߵ'��Š�O ��8_�2}v�	 ��-i��5�	��e�,}�oĖ�~��l����k����S�����1?}��LcϚT7fֱ�EP H�Ĥ�G=��2T�/�Y��5k^_X*+��g�md���.<��)�e�?�>���?I0d��]g��L[����|0�S���%}���6@5*n��J�-o+���KI�,<�M*_��-�����^���ƒ�֛���  �$��b3�PAB\k��L�u{�m���7A��Ă���?�8��ç�&Z?# pd  �uH�e��-�A �Rz��&˶9=~ug�E , ���9����l����D�"�}��4H; �H:����͂��	���V#	 ��U(���?�ޞ��OlJ,3Ev C�g����_K  4$J�P6l��� ��`�G��&�(S,d{�O�y�sL 4�ӷ;V�X�r:�.�r;���$�[I�M�h�95����|ʪ�PЖ�e��A_	@�Er���f�c� =�ýˢB����4�R�$J[`a�n6+��[Q�j�`n�H�M���}�?@� ѫ����+���ћ`lT�O�c��ߤ�"]��-�/���Ы��Y;��q�+��u,�6�觎W�����ľ��� dT���/����Zz'�~����"�*��� O�J�,��5-��r!Ù@��S%�V!@���=̴[�P���� z\PȨ�`$����12�qg����)l�[σ@o!������z�D��^Be=�����&��d@o�@�#�}i�      [remap]

importer="texture"
type="StreamTexture"
path="res://.import/icon.png-487276ed1e3a0c39cad0279d744ee560.stex"
metadata={
"vram_texture": false
}

[deps]

source_file="res://icon.png"
dest_files=[ "res://.import/icon.png-487276ed1e3a0c39cad0279d744ee560.stex" ]

[params]

compress/mode=0
compress/lossy_quality=0.7
compress/hdr_mode=0
compress/bptc_ldr=0
compress/normal_map=0
flags/repeat=0
flags/filter=true
flags/mipmaps=false
flags/anisotropic=false
flags/srgb=2
process/fix_alpha_border=true
process/premult_alpha=false
process/HDR_as_SRGB=false
process/invert_color=false
process/normal_map_invert_y=false
stream=false
size_limit=0
detect_3d=true
svg/scale=1.0
              GDST               <  WEBPRIFF0  WEBPVP8L#  /��?/��m#��Iߏ[���mÆ�tO�۶rJ��>��"  @p�=��Cd\�(����W��K˾���`�u�Oi�_A�( ���/j#}��H���TIWr�����6JRwwoC�I�wk�F*����H7��e@3���O~������Qi�s���c��{g��g��{ow6�~�.�juTnu�=�?�sm�tX�H���5����q��$Ҿ90d��|�&w��=#l�ѽ�6I�h��ǂ��؜!]魗B,�Х�t�J�������,EJ�i�w�P��Ԯ[,�[]�2�䄟M�j��(E��i�V�ȇZ�aS�Ԫr���aӽ[�ʃ��6���r�$�i�������ov�A6��A��)u/X_�)���;K���:gXg:UZr����l,k,��5Sɺ�z1�D�󲔾��,lGYZ��L���ؑL��I���/Eg�f�o�-�,K��$����k�}���������]&�r?K��B@�Ku�Y8�Y�Wf=K�z�lf)�$�,������%���!Tj2�U
`���޿�p�&X�',�K��LC��� zlRz�^�8č�)�P�$��0zsab �lF8�P3@�Y���)4��u��~�s@��zt��D:R�1��U�t2��u�;��L�N�?��>�F]؟#��==�ghw�`A�7�����=��"�wU����\W�5�uB,#�ZQ�W$@���-5~�ruܔ1�F�x}�0�ˍ�/qr0Ў��@�D\R�H�����P���r�[��
�¹�F�{N�>�|�sia�[����=��0^���u0����!�?��0b���43�-����goMc6�v�e��X;Q�˃�'F*Þ�[ܾ�v �CѮ�6��M���Y�9gD7r��q�n�UCN�-e�D��Um�n���]��:�v�dg���[T�^iz�N��;��q��=���ѻ<���!z���t�����������M<C��C�����C��'�~r�׽�}��[ׄ^S)ze��[lG�N�M]��:���I��mD��U-��AdՐӬD4��"�n�\N��!Wa�͋���Sԃ���-n�EK�--yP�P̝�튵�e�ޞ�l��XԃYͲ���d�gΆ��Yw �]v�p��ȍ���؂W�\�}h���B�huӜ���ܔ[X�R�F]X��8����ŃN u���1R��PN�R����(^�J�J�����z�{j���J�z��j"��JJ�e�aKb��U������0��??q��ݤC�sd���jD��t�\�弢��Ge&���	�դ۷=�\W�CK�H��H�V�T�EyShL�ޫШ!����6�İ������C�,	�*!�nDa#V9��9�8d@`�FFNy$���؋&dob}�_�������i�$�ư��I����N�\+kkI���l3�t��m �����$ږ�\�ZH��~�
T��W�����$�d鉃D�~E��2I�I=2tn�ܲ%,;�-�W�r3�5��������v\^N��$�_��T�g�E�'3���Fp�J&[p].�
�|��3�0�Z%S�;/��Ȭ��2�I!�������L>יּ����p1ɡ��9ݩ��4�����?T�J�n�\<u*I����oE
��'�3�ZB������N#�U��~#�7�����󚈴-�$��m�XB�t�팖�|���ԚArn+�7f��}e6���/w�0J���_���O;]㚾�qW�V������{���}���V��:���s�^����^����z��w����P:�J�         [remap]

importer="texture"
type="StreamTexture"
path="res://.import/white-circle.png-fd9ec96f5f813bd0d459d50130c980de.stex"
metadata={
"vram_texture": false
}

[deps]

source_file="res://white-circle.png"
dest_files=[ "res://.import/white-circle.png-fd9ec96f5f813bd0d459d50130c980de.stex" ]

[params]

compress/mode=0
compress/lossy_quality=0.7
compress/hdr_mode=0
compress/bptc_ldr=0
compress/normal_map=0
flags/repeat=0
flags/filter=true
flags/mipmaps=false
flags/anisotropic=false
flags/srgb=2
process/fix_alpha_border=true
process/premult_alpha=false
process/HDR_as_SRGB=false
process/invert_color=false
process/normal_map_invert_y=false
stream=false
size_limit=0
detect_3d=true
svg/scale=1.0
      �PNG

   IHDR   @   @   %�  	KIDATx�՘|#�ƳFm3��Lj�\�V���Y�k�<k���jm��{�d��j6I�鯧�=k��������v�|�"������qk6����z�EZVd!�.	��ũ��S�: $ݓ��� p{6�� OH��!=�$�4� �v ���&�pg6��y��Bz���!�
�e��<�J���y<�7��X�'T����c�3�J7���)���Vr������%T/ ��=]:y�I���@�!l���G	!��� <���`	�7�d���BZ3@��ʺ0�s���&��	Jl��S{�׏�b�������J���C'O:@<@@H�o���˳Q��g�/�q��_gg5�= ;B��O6d0Dw��q��$�D ���>�*�,��CpXl�֤��'+Τg�22/1�����9�ǐ��7�TA�!�3 �\���ڼ��Kj��RV9d\,a�v+f�����)��P��`�Sr��GU���w׼���W�0O��	�Q����!�<3���ߍ���1�O�x`��C��;�s����$���a�owR�"9���_��Q�<�y����`�󀵔q���Td*�и��gP���=� Sq��9y�
=ѷ\�.5t����Q�����t�������3E�G�RN2 ���;_K��]%�! ��y/��<(��G�32Tne%6����w��6:�������'Ø� ?Aŀ�E	G1 z����7��\���("�xe%0*AY���!��k��޿6k#��\r��(�>4�2�c<���gP�r�(�8@5Fd��}o2�/>@�m�\�Ť�4�f�����<;]Ӡd=��l����3`>pK�����R�f=F7k�Uy���M[��lY�,a4�ޔ$C�(���O�(�3@����Cn3���C��Z
t�	�N\Ϸgv퀤�!�f���5n� �*z�f�{c���_=jj/8�a�T;Y5������:3_��}�%N��{h{\�z���[�
J�@�>��뤲�Pz�3]E����3�S���0"8�}�&f'f&�~���"a����"M�G �PyJN�u:��tb����[V�e*��[�ci���qr�>
�ARmw�$ԍ+8�ӆ�Φ /5=�nwR��1pdz�P���G8�=[9�\�J.��jg�*$, �e� �����j�撅���V7 غ�����1�����ҙ����WO Ç���$6pi]*֬G����k�7�6�9�<Cb�-����rp�d���G���D��{�6�c#D ]� �%$�a����=� -ض#g�,Ǯ
�&N=�t�3�1L!�)��` �w����S N���x����۾9M8��]�/Me ��/��+�i��v�±V�r�}�$�u�'2`?�X�������������;g!�[��[�H@��@3,_W��U���\��}�x��<>5=���sՁ��@'��_���c,\��U���r��=������_�Kg���Y�~�/_d�2����J����T*KFg&�6L��+x�3�Nk`˶Q�=�,_׭gn�g�%a��˝T�����Y�����:!��a�0*]����ox�8��ظ�����ә�K0���<����; =��K�Z�p�i��u�0�k�.���}Z�,����v ��Цk��p�rZ�7L�X�~��_���F�Z��j��S�8�|7���"���j�����`���w�{� ��R���I�4iEұgW<l}|r$)  ���uR���݀�p7+���hN�T�g�\�̯�mu�ٔ��jEPB�v�w�����-� �0�vr[٠�}vn�U�t�������ء�_~1܅�O�����-I9���@	��PM||ܔ6��� I
���▖z�@Y���H�\T�Q3t4#4}��[� �L��I�l�TF���Tg���s�� ����{O�����l��Ea���� �.]�����qC��6'4�1��{s�����0�~Vص=��{s��n�M[�:˹~��v$E�l `��^I���?���T`� �x𕥙����w-)���c. l�~u�_�ډ�xPxR��W ��\ ع���{wR����4 l���$>lѱop�� ����p���}��M���ۺ(ث{��Oj6����>I����J�p�bQ$�Eh W���~����}�L�@Z4���e@p#��Oa`H#hIPw�sڐ�am`#�&���n� �B����h�@`IR��+ �
N�5b ��L}k� �ABs���0�/��Ǯ���    IEND�B`�            ECFG	      application/config/name      	   CirclePop      application/config/description�      �   Demo of a simple game using visual script.
You must click the circles to 'pop' them in
order to stop their invasion of the screen.     application/run/main_scene         res://Main.tscn    application/config/icon         res://icon.png     gdnative/singletons          $   rendering/quality/driver/driver_name         GLES2   %   rendering/vram_compression/import_etc         &   rendering/vram_compression/import_etc2          )   rendering/environment/default_clear_color      ���=r�>��H>  �?   