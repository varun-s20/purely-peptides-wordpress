"""
Turns the client's vial photographs into the per-size product shots the site
uses, named by convention so src/data.js picks them up with no other edit:

    public/img/products/<product-slug>-<size-slug>.jpg     e.g. semaglutide-5-mg.jpg

    python tools/product-photos.py "mdnjuan-attachments" "mdnjuan-attachments (1)"

The client sends 2048px squares with the vial filling about two thirds of the
frame. They are cropped to the centre 80% (so the vial fills the frame the way
the existing catalogue shots do) and saved at 900px - the size every template
already declares, so nothing reflows.

Adding a new batch: open the photos, add one MAP line per file (source file
name -> "slug|size label", exactly as src/data.js spells both), re-run. A file
not in MAP is reported and skipped, never guessed at.

Needs Pillow (pip install pillow). Source folders are gitignored client drops.
"""

import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'img', 'products')
SIZE = 900
CROP = 0.80

MAP = {
    # 21 Sep 2026 batch
    '11CC7B02-6DDF-43C2-AA1C-677859F18C65.jpeg': 'cartalax|20 mg',
    '1361EE3F-0C54-4AD2-87E9-5C7B82EBCB9D.jpeg': 'epitalon|10 mg',
    '1DBA4081-9347-4A57-AA14-F7E4D59F634F.jpeg': 'adamax|10 mg',
    '2BC3ECE8-AC4F-4940-90B8-B3AA57EC6AAB.jpeg': 'dsip|5 mg',
    '49D96222-495D-45C9-BA3C-CF7823E696BC.jpeg': 'cjc-1295|10 mg',
    '4CB4D164-5783-46CE-9188-DB4B0748AF04.jpeg': 'cjc-1295|5 mg',
    '50DE4E0A-099F-405D-AC4B-25CAC3B29D5D.jpeg': 'ipamorelin|5 mg',
    '525F9E98-8F25-4FC6-B802-66906524BC40.jpeg': 'melanotan-2|10 mg',
    '6796C6EF-663B-42E4-9917-3DB21C9BA0C3.jpeg': 'ipamorelin|10 mg',
    '7E8C5A38-984F-4BB3-A666-48920C96BC0E.jpeg': 'tb-500|10 mg',
    '8E3E2D6F-ED9D-4C74-BB63-8845FCDB9FB2.jpeg': 'ara-290|10 mg',
    '9D94A942-D718-4BA3-962A-7E043FEBD31F.jpeg': 'kisspeptin-10|10 mg',
    'B3D67196-4C86-44FD-96BA-578C9C7EB8CC.jpeg': 'kpv|10 mg',
    'C77FA400-E721-430C-9669-258175BCC6E0.jpeg': 'melanotan-1|10 mg',
    'Canva AI Image Sep 21_ 2026 at 1_53_29 AM.jpeg': 'glutathione|600 mg',
    'Canva AI Image Sep 21_ 2026 at 1_55_33 AM.jpeg': 'glutathione|1500 mg',
    'D7F592DD-7E98-470B-B147-7E826506EE7A.jpeg': 'epitalon|50 mg',
    'FE595B5E-912B-4901-AF98-DD8C592606C4.jpeg': 'tb-500|5 mg',
    '04F366A3-67AB-42C2-BD2A-AE0C4A3F2395.jpeg': 'sermorelin|5 mg',
    '08FB49CC-D1D8-483C-A1AF-33ECE06133FA.jpeg': 'tirzepatide|30 mg',
    '0AA88A7D-695A-4D00-81C6-51BA044D7848.jpeg': 'bpc-157|10 mg',
    '0D8256FB-1FC6-4469-8484-75A08B5993FE.jpeg': 'bpc-157|15 mg',
    '106A08F2-0780-4045-80EB-E273CF0E9283.jpeg': 'klow|50/10/10/10 mg',
    '1AAE6D46-F058-465A-9F46-74245D8269BC.jpeg': '5-amino-1mq|10 mg',
    '1B7F6BE8-873C-44EB-87DB-88B99CD1FD26.jpeg': 'tesamorelin|20 mg',
    '1F245DBD-E4E9-4DEE-B2DB-0C99865D9017.jpeg': 'tesamorelin|10 mg',
    '2DDE9B79-30B3-41A7-9F0D-C5B790371B54.jpeg': 'semaglutide|50 mg',
    '33112D88-FE3A-49F1-8628-3DD1E6179F03.jpeg': 'semaglutide|20 mg',
    '3E5DC342-BC0E-41C6-9020-2E0A78B8AAAE.jpeg': 'selank|10 mg',
    '522E9173-4133-4F6E-B584-9B320ADF0CF1.jpeg': 'bpc-tb|10/10 mg',
    '5C8A72C3-7B2B-4536-9D0B-AE8D9B9FF9B4.jpeg': 'mots-c|10 mg',
    '5D58587D-EAC3-47D9-9086-B6609E27DF17.jpeg': 'tirzepatide|20 mg',
    '6744C783-B56B-4D39-AF4C-6A54FF772A59.jpeg': 'aod-9604|5 mg',
    '68A6B80E-C35B-43A7-B73C-ED918FA33C96.jpeg': 'nad|1000 mg',
    '6A848D4A-696D-41D4-B1EA-DBA06F769C1B.jpeg': 'retatrutide|30 mg',  # labelled "GLP 3R-"
    '6AC6A5A8-B749-41F2-8348-83CA45139AEC.jpeg': 'retatrutide|10 mg',
    '79F8EAD1-4A6F-431F-BA7D-F14A015EE4C8.jpeg': 'ghk-cu|100 mg',
    '7DA658CB-9BCF-4CC8-8EB3-F0E8D10109C6.jpeg': 'semaglutide|5 mg',
    '8DD942EA-2913-40F8-B276-B7CF4BDB3DB9.jpeg': 'aod-9604|10 mg',
    '8E12A866-390E-420D-94BD-E6CFF996D126.jpeg': 'semaglutide|30 mg',
    '8FE03FAD-7920-4E08-93D8-3B71A66F36A2.jpeg': 'bpc-157|100 mg',
    '953A3E65-E63A-4972-ADE6-A4FB12E7C4DB.jpeg': 'glow|50/10/10 mg',
    '9BE3FC23-0D52-49AE-B291-CFDEC2041ED9.jpeg': 'mots-c|40 mg',
    'A0EB3432-66BA-4F3A-96D7-516B6A222959 (1).jpeg': 'tirzepatide|100 mg',
    'A0EB3432-66BA-4F3A-96D7-516B6A222959.jpeg': 'tirzepatide|100 mg',
    'B220009C-8408-4D56-8334-11A479BCBFD5.jpeg': 'tirzepatide|60 mg',
    'BE347F3B-9862-43C6-BBF0-C707363FC8DD.jpeg': 'retatrutide|60 mg',
    'BE5E00D5-F75C-4C98-8CA6-2A386C79F2AD.jpeg': '5-amino-1mq|50 mg',
    'C47343D9-054E-4A45-99E7-89BC21F058DA.jpeg': 'cagrilintide|10 mg',
    'C59F2166-1015-4936-BAA4-80FD8C8843D1.jpeg': 'nad|500 mg',
    'D175DD31-99BE-4D53-9650-C4395157D55C.jpeg': 'semax|10 mg',
    'D175DD31-99BE-4D53-9650-C4395157D55C (1).jpeg': 'semax|10 mg',
    'D175DD31-99BE-4D53-9650-C4395157D55C (2).jpeg': 'semax|10 mg',
    'DAC7F3B9-202C-45CE-B2EA-ED312824F1CF.jpeg': 'ghk-cu|50 mg',
    'DAE604BF-988C-4E90-B3AC-A1DDC8196730.jpeg': 'semaglutide|10 mg',
    'E18E8A5F-2F41-448C-8997-F228A9345701.jpeg': 'bpc-157|5 mg',
    'E343E267-5AD2-4776-B827-6C931567E2DB.jpeg': 'retatrutide|48 mg',
    'EBDF4213-0DF0-4E82-BC16-599D48F23F57.jpeg': 'cagrilintide|16 mg',
    'FD6C4075-83CB-4C3D-AE08-D60E7041F12D.jpeg': 'retatrutide|20 mg',
    'FDA266D2-223A-48E7-9C8A-8BF929C77CEB.jpeg': 'tirzepatide|10 mg',
}

# Received but not used - kept here so a re-run does not report them as new.
SKIP = {
    '29C8263F-0BDC-4CAC-BD54-D1FCA42C964A.jpeg': 'ARA-290 16 mg - no 16 mg size on the inventory sheet',
    '10234D1E-9AAE-468B-86D7-3A921CF5480F.jpeg': 'AOD-9604 5 mg, alternate label - 6744C783 used',
    '9C23A212-BEEA-416F-BBEC-F4BEDD60ABF8.jpeg': 'KPV 10 mg, alternate label - B3D67196 used',
    '8FCE7C1F-4009-4602-8223-6DBBDF8BB561.jpeg': 'Selank 10 mg, alternate label - 3E5DC342 used',
    'C8443F8E-93E3-4B2F-AECE-8E103AB1C995.jpeg': 'Semaglutide 20 mg, alternate label - 33112D88 used',
}


def slug(s):
    return re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', s.lower()))


def main(dirs):
    os.makedirs(OUT, exist_ok=True)
    written, unknown = set(), []
    for d in dirs:
        for name in sorted(os.listdir(d)):
            if not name.lower().endswith(('.jpg', '.jpeg', '.png')) or name in SKIP:
                continue
            key = MAP.get(name)
            if not key:
                unknown.append(os.path.join(d, name))
                continue
            product, size = key.split('|')
            dest = os.path.join(OUT, f'{product}-{slug(size)}.jpg')
            if dest in written:
                continue
            im = Image.open(os.path.join(d, name)).convert('RGB')
            w, h = im.size
            side = int(min(w, h) * CROP)
            left, top = (w - side) // 2, (h - side) // 2
            im = im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)
            im.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)
            written.add(dest)
    print(f'{len(written)} product shots written to public/img/products/')
    if unknown:
        print('Not in MAP (skipped) - add a line for each:\n  ' + '\n  '.join(unknown))


if __name__ == '__main__':
    main(sys.argv[1:] or ['mdnjuan-attachments', 'mdnjuan-attachments (1)'])
