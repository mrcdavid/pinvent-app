# pinvent-app
# this is for practice purposes only

closedxml install

public Form1()
        {
            InitializeComponent();
            txtShow.MaxLength = 10;
    }

private void txtShow_TextChanged(object sender, EventArgs e)
        {
         //   txtShow.Text = txtShow.Text.Length.ToString();

            if (txtShow.Text.Length == 10 )
            {
                MessageBox.Show("You entered Max Character");
            }
        }

        private void txtShow_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (!char.IsControl(e.KeyChar) && !char.IsLetterOrDigit(e.KeyChar))
            {
                e.Handled = true;
            }
        }

    private void txtShow_TextChanged(object sender, EventArgs e)
        {
         //   txtShow.Text = txtShow.Text.Length.ToString();

            if (txtShow.Text.Length == 10 )
            {
                MessageBox.Show("You entered Max Character");
            }
        }

        private void txtShow_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (!char.IsControl(e.KeyChar) && !char.IsLetterOrDigit(e.KeyChar))
            {
                e.Handled = true;
            }
        }

    private void ExportToExcel_Click(object sender, EventArgs e)
        {
            dataGridView1.SelectAll();
            DataObject copydata = dataGridView1.GetClipboardContent();
            if (copydata != null) Clipboard.SetDataObject(copydata);
            Microsoft.Office.Interop.Excel.Application xlapp = new Microsoft.Office.Interop.Excel.Application();
            xlapp.Visible = true;
            Microsoft.Office.Interop.Excel.Workbook xlWbook;
            Microsoft.Office.Interop.Excel.Worksheet xlsheet;
            object miseddata = System.Reflection.Missing.Value;
            xlWbook = xlapp.Workbooks.Add(miseddata);

            xlsheet = (Microsoft.Office.Interop.Excel.Worksheet)xlWbook.Worksheets.get_Item(1);
            Microsoft.Office.Interop.Excel.Range xlr = (Microsoft.Office.Interop.Excel.Range)xlsheet.Cells[1, 1];
            xlr.Select();

            xlsheet.PasteSpecial(xlr, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, true);

        }
